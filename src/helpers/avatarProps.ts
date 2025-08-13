import type { SxProps, Theme } from "@mui/system";
import stringToColor from "./stringToColor";

export const avatarProps = (
  name: string,
  avatar?: string,
  sx: SxProps<Theme> = {}
) => {
  return {
    sx: {
      ...sx,
      bgcolor: stringToColor(name),
    },
    children: name.charAt(0),
    src: avatar,
    alt: name,
  };
};
