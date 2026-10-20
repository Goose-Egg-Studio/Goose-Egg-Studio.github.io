export const PLATFORMS = [
  { id: 'taptap', label: 'TapTap' },
  { id: 'appStore', label: 'App Store' },
  { id: 'bilibili', label: 'Bilibili' },
  { id: 'x', label: 'X' },
  { id: 'googlePlay', label: 'Google Play' },
] as const
export type PlatformId = typeof PLATFORMS[number]['id']
export type PlatformLinks = Partial<Record<PlatformId, string>>
export type Person = { name: string; alias?: string; contribution?: string }
export type PersonInput = string | Person
// members 的第一项是组长，和其他成员使用相同的渲染方式。
export type Group = { id: string; title: string; section?: string; sectionEn?: string; en?: string; description?: string; members: PersonInput[] }
export type CreditsData = { schemaVersion: 2; studio: { name: string; eyebrow?: string; intro: string; closing: string; closingEn?: string; demo: boolean }; links?: PlatformLinks; creators?: PersonInput[]; memberOrder: 'shuffle' | 'input' | 'name'; groups: Group[] }
export type DisplayGroup = Omit<Group, 'members'> & { members: Person[] }
export type DisplaySection = { id: string; title?: string; en?: string; groups: DisplayGroup[] }

export function person(input: PersonInput): Person { return typeof input === 'string' ? { name: input } : { ...input } }
function validatePeople(input: unknown, title: string): void {
  if (!Array.isArray(input)) throw new Error(`${title}：名单必须是数组。`)
  const names = new Set<string>()
  for (const entry of input) {
    if (!entry || (typeof entry !== 'string' && typeof entry !== 'object')) throw new Error(`${title}：成员格式无效。`)
    const p = person(entry)
    if (typeof p.name !== 'string' || !p.name.trim() || (p.alias !== undefined && typeof p.alias !== 'string') || (p.contribution !== undefined && typeof p.contribution !== 'string')) throw new Error(`${title}：昵称不能为空，英文名和职责必须是文字。`)
    const key = JSON.stringify([p.name.trim().toLocaleLowerCase(), (p.alias || '').trim().toLocaleLowerCase()])
    if (names.has(key)) throw new Error(`${title}：署名「${p.name}」重复，请合并重复条目。`)
    names.add(key)
  }
}
export function validateData(value: unknown): CreditsData {
  const data = value as CreditsData
  if (!data || data.schemaVersion !== 2 || !data.studio || typeof data.studio.name !== 'string' || !data.studio.name.trim() || typeof data.studio.intro !== 'string' || typeof data.studio.closing !== 'string' || typeof data.studio.demo !== 'boolean') throw new Error('名单格式不正确：检查 schemaVersion 和工作室设置。')
  if (data.studio.eyebrow !== undefined && typeof data.studio.eyebrow !== 'string') throw new Error('英文标语必须是文字。')
  if (data.studio.closingEn !== undefined && typeof data.studio.closingEn !== 'string') throw new Error('英文结束语必须是文字。')
  if (data.links !== undefined) {
    if (!data.links || typeof data.links !== 'object' || Array.isArray(data.links)) throw new Error('平台链接必须是对象。')
    for (const [id, value] of Object.entries(data.links)) {
      if (!PLATFORMS.some(platform => platform.id === id) || typeof value !== 'string') throw new Error('平台名称或链接格式无效。')
      if (!value) continue
      let url: URL
      try { url = new URL(value) } catch { throw new Error('平台链接必须是完整的 HTTPS 地址。') }
      if (url.protocol !== 'https:') throw new Error('平台链接必须使用 HTTPS。')
    }
  }
  if (!['shuffle', 'input', 'name'].includes(data.memberOrder)) throw new Error('成员排列方式无效。')
  if (!Array.isArray(data.groups)) throw new Error('groups 必须是分组数组。')
  if (data.creators !== undefined) validatePeople(data.creators, '主创')
  const ids = new Set<string>()
  for (const group of data.groups) {
    if (!group || typeof group.id !== 'string' || !group.id.trim() || group.id === '__creators' || ids.has(group.id) || typeof group.title !== 'string' || !group.title.trim()) throw new Error('分组必须有唯一 ID 和非空名称，不能使用保留 ID __creators。')
    if ((group.en !== undefined && typeof group.en !== 'string') || (group.description !== undefined && typeof group.description !== 'string')) throw new Error('分组说明和英文名称必须是文字。')
    if (group.section !== undefined && (typeof group.section !== 'string' || !group.section.trim())) throw new Error('所属阶段必须是非空文字。')
    if (group.sectionEn !== undefined && (typeof group.sectionEn !== 'string' || !group.sectionEn.trim())) throw new Error('英文分区标题必须是非空文字。')
    ids.add(group.id)
    validatePeople(group.members, group.title)
  }
  return JSON.parse(JSON.stringify(data)) as CreditsData
}

// 主创没有组长固定首位规则；所有署名按统一的排列配置展示。
export function displayCreators(data: CreditsData, random: () => number = Math.random): DisplayGroup[] {
  const members = (data.creators || []).map(person)
  if (!members.length) return []
  if (data.memberOrder === 'shuffle') {
    for (let i = members.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [members[i], members[j]] = [members[j], members[i]] }
  } else if (data.memberOrder === 'name') members.sort((a,b) => a.name.localeCompare(b.name, 'zh-CN', { numeric: true }))
  return [{ id: '__creators', title: '主创', en: 'CREATOR', members }]
}

export function displayGroups(data: CreditsData, random: () => number = Math.random): DisplayGroup[] {
  return data.groups.map(group => {
    const [first, ...rest] = group.members.map(person)
    // 只处理首位以外的成员。排序与筛选不会重新随机，也不会改变源数据。
    if (data.memberOrder === 'shuffle') {
      for (let i = rest.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [rest[i], rest[j]] = [rest[j], rest[i]] }
    } else if (data.memberOrder === 'name') rest.sort((a,b) => a.name.localeCompare(b.name, 'zh-CN', { numeric: true }))
    return { ...group, members: first ? [first, ...rest] : [] }
  })
}

// 仅将相邻且属于同一阶段的职位归在一起，保留名单中的阶段、职位与成员顺序。
export function displaySections(groups: DisplayGroup[]): DisplaySection[] {
  const sections: DisplaySection[] = []
  for (const group of groups) {
    const previous = sections[sections.length - 1]
    if (previous && previous.title === group.section) previous.groups.push(group)
    else sections.push({ id: group.id, title: group.section, en: group.sectionEn, groups: [group] })
  }
  return sections
}

export function filterGroups(groups: DisplayGroup[], category: string, query: string): DisplayGroup[] {
  const term = query.trim().toLocaleLowerCase()
  return groups.filter(group => category === 'all' || group.id === category).map(group => {
    const groupMatch = [group.title, group.en || ''].some(v => v.toLocaleLowerCase().includes(term))
    const matches = (p: Person) => !term || groupMatch || [p.name, p.alias || '', p.contribution || ''].some(v => v.toLocaleLowerCase().includes(term))
    return { ...group, members: group.members.filter(matches) }
  }).filter(group => group.members.length > 0)
}
