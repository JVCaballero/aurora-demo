import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  onClick, 
  disabled = false,
  className = '',
  type = 'button',
  icon
}) => {
  const baseClass = 'btn';
  const variantClass = `btn--${variant}`;
  const sizeClass = `btn--${size}`;
  const disabledClass = disabled ? 'btn--disabled' : '';
  
  return (
    <button
      type={type}
      className={`${baseClass} ${variantClass} ${sizeClass} ${disabledClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="btn__icon">{icon}</span>}
      <span className="btn__text">{children}</span>
    </button>
  );
};

export default Button;