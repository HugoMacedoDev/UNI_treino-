import uniforLogo from '../assets/logounifor.png';

function Logo({ size = 32, iconOnly = false }) {
  return (
    <div className="unitreino-logo" aria-label="UNI Treino">
      <img
        src={uniforLogo}
        alt="Logo Unifor"
        style={{
          height: size,
          width: 'auto',
          objectFit: 'contain',
          display: 'block',
          flexShrink: 0,
        }}
      />
      {!iconOnly && (
        <span className="logo-text">
          <span className="logo-uni">UNI</span>
          <span className="logo-treino"> Treino</span>
        </span>
      )}
    </div>
  );
}

export default Logo;
