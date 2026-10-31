/* Pure data helpers: legacy backups, team ledgers and judge-mark ranking. */
export const PRIZE_POINTS = Object.freeze({ 1: 5, 2: 3, 3: 1 });
export const TEAM_COLORS = ['#2c6b60', '#9c6f44', '#6766a7', '#b15e61', '#4c7b9b', '#838346', '#805f91', '#57866b'];

export function parseTeams(text) {
  const values = String(text || '').split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
  const unique = [...new Map(values.map(s => [s.toLocaleLowerCase(), s])).values()];
  if (!unique.length) throw new Error('Add at least one team to start your festival.');
  if (unique.length > 20) throw new Error('Maximum 20 teams per festival.');
  if (unique.some(t => t.length > 65)) throw new Error('Team names must be 65 characters or less.');
  return unique;
}

export function migrateDB(data) {
  const db = data;
  if (!Array.isArray(db.teams)) db.teams = [];
  db.teams = db.teams.filter(t => t && typeof t.id === 'string' && typeof t.name === 'string');
  const colors = TEAM_COLORS;
  // v1 stored the team as a free-text 'house' on each student. Preserve it.
  for (const s of db.students) {
    const oldName = typeof s.house === 'string' ? s.house.trim() : '';
    if (oldName && !db.teams.some(t => t.name.toLocaleLowerCase() === oldName.toLocaleLowerCase())) {
      const index = db.teams.length;
      db.teams.push({ id: `legacy-team-${index + 1}`, name: oldName, color: colors[index % colors.length] });
    }
    if (!db.teams.some(t => t.id === s.teamId)) {
      s.teamId = db.teams.find(t => t.name.toLocaleLowerCase() === oldName.toLocaleLowerCase())?.id || '';
    }
  }
  db.teams.forEach((t, i) => {
    if (!/^#[0-9a-f]{6}$/i.test(t.color || '')) t.color = colors[i % colors.length];
  });
  if (!db.counters || typeof db.counters !== 'object') db.counters = {};
  let max = Number(db.counters.program) || 0;
  const used = new Set();
  for (const p of db.programs) {
    const match = /^P(\d+)$/i.exec(p.code || '');
    if (match && !used.has(p.code)) {
      max = Math.max(max, Number(match[1]));
      used.add(p.code);
    } else p.code = '';
  }
  for (const p of db.programs) {
    if (!p.code) { do { max += 1; p.code = `P${String(max).padStart(3, '0')}`; } while (used.has(p.code)); used.add(p.code); }
    if (p.result && (!p.result.marks || typeof p.result.marks !== 'object')) p.result.marks = {};
  }
  db.counters.program = max;
  db.version = 2;
  return db;
}

export function ledger(db) {
  const students = new Map(db.students.map(s => [s.id, s]));
  const teams = new Map(db.teams.map(t => [t.id, t]));
  const categories = new Map(db.categories.map(c => [c.id, c.name]));
  const records = [];
  for (const program of db.programs) {
    if (!program.result?.published) continue;
    for (const rank of [1, 2, 3]) {
      const sid = program.result.places?.[rank];
      const student = students.get(sid);
      if (!student || !teams.has(student.teamId)) continue;
      records.push({
        programId: program.id, code: program.code || '—', program: program.name,
        date: program.date || '', category: categories.get(program.categoryId) || 'Uncategorised',
        teamId: student.teamId, team: teams.get(student.teamId).name,
        studentId: student.id, student: student.name, chest: student.chest,
        rank, points: PRIZE_POINTS[rank], mark: program.result.marks?.[student.id] ?? null
      });
    }
  }
  return records;
}

export function standings(db) {
  const rows = db.teams.map(t => ({ ...t, points: 0, first: 0, second: 0, third: 0 }));
  const byId = new Map(rows.map(t => [t.id, t]));
  for (const item of ledger(db)) {
    const row = byId.get(item.teamId);
    row.points += item.points;
    row[['', 'first', 'second', 'third'][item.rank]] += 1;
  }
  return rows.sort((a, b) => b.points - a.points || b.first - a.first || a.name.localeCompare(b.name));
}

export function rankByMarks(participants, students, marks) {
  const roster = new Map(students.map(s => [s.id, s]));
  return participants.map(id => roster.get(id)).filter(s => s && Number.isFinite(marks[s.id]))
    .sort((a, b) => marks[b.id] - marks[a.id] || Number(a.chest) - Number(b.chest))
    .slice(0, 3).map(s => s.id);
}
