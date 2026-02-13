import styles from "./TextArea.module.css";

type TextAreaProps = {
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  rows?: number;
};

const TextArea = ({
  setMessage,
  className,
  inputClassName,
  placeholder = "Écris ton message…",
  rows = 2,
}: TextAreaProps) => {
  return (
    <div className={className ?? undefined}>
      <textarea
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => setMessage(e.target.value)}
        className={inputClassName ?? styles.textArea}
      />
    </div>
  );
};

export default TextArea;
