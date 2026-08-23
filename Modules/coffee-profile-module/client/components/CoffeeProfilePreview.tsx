import { useTranslation } from 'react-i18next'

import type { CoffeeProfile, CoffeeSettings } from '../types'

function pct(value: number, min: number, max: number): number {
  const span = max - min
  if (span <= 0) return 0
  return Math.max(0, Math.min(100, ((value - min) / span) * 100))
}

export function CoffeeProfilePreview({ settings, profile }: { settings: CoffeeSettings; profile: CoffeeProfile }) {
  const { t } = useTranslation()
  const c = settings.colors
  const style = {
    background: c.card_bg,
    color: c.card_text,
    border: `1px solid ${c.card_border}`,
    borderRadius: settings.radius,
    padding: settings.gap,
    display: 'grid',
    gap: settings.gap,
    fontFamily: 'inherit',
  } as const
  const labelStyle = { fontSize: settings.font_label, color: c.label }
  const titleStyle = { fontSize: settings.font_title, fontWeight: 700, margin: 0, color: c.card_text }
  const valueStyle = { fontSize: settings.font_value, fontWeight: 700, color: c.value }
  const robusta = profile.blend_robusta
  const arabica = profile.blend_arabica
  const blendSum = Math.max(1, robusta + arabica)

  return (
    <div style={style} dir="rtl">
      <div>
        <p style={titleStyle}>{t('coffeeProfile.blend')}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0', ...labelStyle }}>
          <span>
            {settings.robusta_label} <strong style={valueStyle}>{robusta}٪</strong>
          </span>
          <span>
            {settings.arabica_label} <strong style={valueStyle}>{arabica}٪</strong>
          </span>
        </div>
        <Bar track={c.track} fill={c.blend_fill} height={settings.bar_height} width={(100 * robusta) / blendSum} />
      </div>

      <div>
        <p style={titleStyle}>{t('coffeeProfile.acidity')}</p>
        <div style={{ position: 'relative', padding: '22px 0 18px' }}>
          <div
            style={{
              position: 'absolute',
              insetInline: 8,
              top: '50%',
              height: settings.stroke_width,
              background: c.acidity_line,
              transform: 'translateY(-50%)',
            }}
          />
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${Math.max(1, settings.acidity_levels.length)}, minmax(0,1fr))` }}>
            {settings.acidity_levels.map((level) => (
              <div key={level.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center' }}>
                <span style={{ ...labelStyle, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{level.label}</span>
                <span style={{ width: 12, height: 12, borderRadius: 99, background: c.acidity_dot, boxShadow: `0 0 0 2px ${c.acidity_dot}`, border: `2px solid ${c.card_bg}` }} />
                <span style={valueStyle}>{profile.acidity[level.id] ?? settings.scale_min}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p style={titleStyle}>{t('coffeeProfile.caffeine')}</p>
        <p style={{ ...valueStyle, margin: '6px 0' }}>
          {profile.caffeine_mg} {settings.caffeine_unit}
        </p>
        <Bar
          track={c.track}
          fill={c.caffeine_fill}
          height={settings.bar_height}
          width={Math.min(100, (100 * profile.caffeine_mg) / Math.max(1, settings.caffeine_max))}
        />
      </div>

      {(
        [
          ['bitterness', t('coffeeProfile.bitterness'), c.bitterness_fill],
          ['sweetness', t('coffeeProfile.sweetness'), c.sweetness_fill],
          ['body', t('coffeeProfile.body'), c.body_fill],
        ] as const
      ).map(([key, title, fill]) => {
        const val = profile[key]
        const p = pct(val, settings.scale_min, settings.scale_max)
        return (
          <div key={key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <p style={titleStyle}>{title}</p>
              <span style={valueStyle}>{val}</span>
            </div>
            <div style={{ position: 'relative', marginTop: 6 }}>
              <Bar track={c.track} fill={fill} height={settings.bar_height} width={p} />
              <span
                style={{
                  position: 'absolute',
                  top: '50%',
                  insetInlineStart: `${p}%`,
                  width: settings.bar_height + 6,
                  height: settings.bar_height + 6,
                  borderRadius: 99,
                  background: c.value,
                  border: `2px solid ${c.card_bg}`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Bar({ track, fill, height, width }: { track: string; fill: string; height: number; width: number }) {
  return (
    <div style={{ height, background: track, borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, width))}%`, background: fill, borderRadius: 'inherit' }} />
    </div>
  )
}
