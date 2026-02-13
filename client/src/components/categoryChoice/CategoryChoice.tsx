import styles from "./CategoryChoice.module.css";
import SpinButton from "../SpinButton/SpinButton";
import Button from "../Button/Button";

const CategoryChoice = ({
  onCategorySelect,
  categoryChoiced,
}: {
  onCategorySelect: (category: string) => void;
  categoryChoiced?: string;
}) => {
  const handleCategorySelect = (category: string, e: React.MouseEvent) => {
    e.preventDefault();
    onCategorySelect(category);
  };

  return (
    <div className={styles.categoryChoiceContainer}>
      <Button
        onClick={(e) => handleCategorySelect("dino", e)}
        title="Dino"
        isSelected={categoryChoiced === "dino"}
      />

      <Button
        onClick={(e) => handleCategorySelect("sport", e)}
        title="Sport"
        isSelected={categoryChoiced === "sport"}
      />
      <Button
        onClick={(e) => handleCategorySelect("food", e)}
        title="Food"
        isSelected={categoryChoiced === "food"}
      />
    </div>
  );
};

export default CategoryChoice;
