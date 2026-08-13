import {
  ColorThumb as AriaColorThumb,
  type ColorThumbProps,
} from "react-aria-components/ColorThumb";
import "./ColorThumb.scss";

export function ColorThumb(props: ColorThumbProps) {
  return <AriaColorThumb {...props} />;
}
