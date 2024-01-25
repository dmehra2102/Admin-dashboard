import { getNameInitials } from "@/utilities";
import { Avatar as AntDAvatar, AvatarProps } from "antd";

type Props = AvatarProps & {
  name?: string;
  //   src?: string;
  //   default : string;
  //   style : ;
};

const CustomAvatar = ({ name, style, ...rest }: Props) => {
  return (
    <AntDAvatar
      alt={name}
      size={"small"}
      {...rest}
      style={{
        ...style,
        backgroundColor: "#87d068",
        display: "flex",
        alignItems: "center",
        border: "none",
      }}
    >
      {getNameInitials(name || "")}
    </AntDAvatar>
  );
};

export default CustomAvatar;
