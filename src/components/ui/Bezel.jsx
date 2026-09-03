/**
 * Double-bezel (Doppelrand) enclosure — a machined "plate sitting in a tray".
 * Outer `.bezel` is the aluminum tray (subtle tint + hairline + generous radius);
 * inner `.bezel-core` is the white plate (concentric radius, inset highlight,
 * diffused shadow). Used by Card when `bezel` is set.
 */
export function Bezel({ as: Tag = 'div', className = '', children, style, ...rest }) {
  const cls = ['bezel', className].filter(Boolean).join(' ');
  return (
    <div className={cls} style={style} {...rest}>
      <Tag className="bezel-core">{children}</Tag>
    </div>
  );
}

export default Bezel;
