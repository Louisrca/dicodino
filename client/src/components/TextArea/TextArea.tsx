const TextArea = ({
  setMessage,
}: {
  setMessage: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <div>
      <textarea
        placeholder="Type your message here..."
        rows={4}
        cols={50}
        onChange={(e) => setMessage(e.target.value)}
      />
    </div>
  );
};

export default TextArea;
