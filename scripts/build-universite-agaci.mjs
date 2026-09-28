import fs from 'fs'

const src = JSON.parse(fs.readFileSync(process.env.TEMP + '\\tr-uni.json', 'utf8'))

function trTitle(input) {
  const lower = String(input).trim().replace(/\s+/g, ' ').toLocaleLowerCase('tr-TR')
  return lower
    .replace(/(^|[\s\-/()])(\p{L})/gu, (_, sep, ch) => sep + ch.toLocaleUpperCase('tr-TR'))
    .replace(/ (Ve|İle|Veya|Veya) /g, (m) => m.toLocaleLowerCase('tr-TR'))
    .replace(/\bKktc\b/g, 'KKTC')
    .replace(/\bTbmm\b/g, 'TBMM')
}

const tree = {}
for (const uni of src) {
  const uniName = trTitle(uni.name)
  const faculties = tree[uniName] ?? {}
  for (const fac of uni.faculties || []) {
    const facName = trTitle(fac.name)
    const set = new Set(faculties[facName] || [])
    for (const program of fac.programs || []) {
      const name = trTitle(program.name || '')
      if (name) set.add(name)
    }
    faculties[facName] = [...set]
  }
  tree[uniName] = faculties
}

function withDiger(list) {
  const rest = list.filter((x) => x !== 'Diğer').sort((a, b) => a.localeCompare(b, 'tr'))
  return [...rest, 'Diğer']
}

const out = {}
for (const uniName of Object.keys(tree).sort((a, b) => a.localeCompare(b, 'tr'))) {
  const faculties = {}
  for (const facName of withDiger(Object.keys(tree[uniName]))) {
    if (facName === 'Diğer') {
      faculties['Diğer'] = ['Diğer']
      continue
    }
    faculties[facName] = withDiger(tree[uniName][facName] || [])
  }
  out[uniName] = faculties
}
out['Diğer'] = { Diğer: ['Diğer'] }

const dest = new URL('../src/data/universiteAgaci.json', import.meta.url)
fs.writeFileSync(dest, JSON.stringify(out))

const unis = Object.keys(out).length
let fac = 0
let bol = 0
for (const faculties of Object.values(out)) {
  fac += Object.keys(faculties).length
  for (const departments of Object.values(faculties)) bol += departments.length
}
console.log({ unis, fac, bol, bytes: fs.statSync(dest).size })
