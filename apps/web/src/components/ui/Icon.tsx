import { FontAwesomeIcon, type FontAwesomeIconProps } from '@fortawesome/react-fontawesome';

/** Decorative by default; pass `title` when an icon carries meaning on its own. */
export function Icon(props: FontAwesomeIconProps) {
  return <FontAwesomeIcon fixedWidth {...props} />;
}
