import styles from "./Button.module.css";
import clsx from "clsx";

const Button = ({
  title,
  onClick,
  isSelected,
}: {
  title: string;
  onClick: (e: React.MouseEvent) => void;
  isSelected?: boolean;
}) => {
  return (
    <button
      className={clsx(styles.button, isSelected && styles.selected)}
      onClick={onClick}
    >
      {title}
    </button>
  );
};

export default Button;
