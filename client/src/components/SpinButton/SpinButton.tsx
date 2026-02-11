import { useGSAP } from "@gsap/react";
import clsx from "clsx";
import gsap from "gsap";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import style from "./SpinButton.module.css";

gsap.registerPlugin(useGSAP);

const SpinButton = ({
  title,
  href,
  variant,
  setIsAnimating,
  isAnimating,
}: {
  title?: string;
  href?: string;
  variant?: "primary" | "secondary" | "tertiary";
  setIsAnimating?: (isAnimating: boolean) => void;
  isAnimating?: boolean;
}) => {
  const container = useRef(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rotationRef = useRef(0);
  const navigate = useNavigate();

  const { contextSafe } = useGSAP({ scope: container });

  const rotate = contextSafe(() => {
    if (buttonRef.current) {
      rotationRef.current += 360;
      gsap.to(buttonRef.current, {
        rotation: rotationRef.current,
        duration: 0.6,
        ease: "power2.out",
      });
    }
  });

  const handleClick = () => {
    if (isAnimating) return;

    setIsAnimating?.(true);

    rotate();
    if (href) {
      setTimeout(() => {
        navigate(href);
        setIsAnimating?.(false);
      }, 600);
    }
  };
  return (
    <div ref={container}>
      <button
        ref={buttonRef}
        onClick={handleClick}
        className={clsx(style.button, variant && style[variant])}
      >
        {title || "Spin Me!"}
      </button>
    </div>
  );
};

export default SpinButton;
