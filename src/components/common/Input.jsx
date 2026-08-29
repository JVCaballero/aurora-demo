import './Input.css';

const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  className = '',
  required = false,
  name,
  id
}) => {
  const inputId = id || name;
  
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input__label">
          {label}
          {required && <span className="input__required">*</span>}
        </label>
      )}
      <input
        type={type}
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`input ${error ? 'input--error' : ''}`}
        required={required}
      />
      {error && <span className="input__error">{error}</span>}
    </div>
  );
};

export default Input;