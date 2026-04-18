export const theme = {
  colors: {
    pageBg: '#F5D7E3',
    cardBg: '#fcf1f5',
    cardAltBg: '#fff8fb',
    text: '#11001C',
    subtext: '#40006a',
    border: '#d8c7d0',
    inputBorder: '#d1d5db',
    focus: '#a855f7',

    primary: '#11001C',
    primaryHover: '#2a0a3d',

    secondary: '#6cab80',
    secondaryHover: '#5a9a70',

    danger: '#b76e79',
    dangerHover: '#9d5c66',

    white: '#ffffff',

    errorBg: '#fee2e2',
    errorText: '#b91c1c',

    itemBg: '#fff8fb',
    mutedBg: '#f9eef3',
  },

  radius: {
    sm: '10px',
    md: '14px',
    lg: '20px',
  },

  shadow: {
    soft: '0 4px 15px rgba(0, 0, 0, 0.08)',
    card: '0 12px 30px rgba(0, 0, 0, 0.12)',
  },

  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },

  fontSizes: {
    small: '0.9rem',
    body: '1rem',
    heading: '1.5rem',
    title: '2rem',
  },
};

export const sharedStyles = {
  page: {
    minHeight: '100vh',
    background: theme.colors.pageBg,
    padding: theme.spacing.lg,
    boxSizing: 'border-box',
  },

  container: {
    width: '100%',
    maxWidth: '1000px',
    margin: '0 auto',
  },

  card: {
    background: theme.colors.cardBg,
    padding: theme.spacing.xl,
    borderRadius: theme.radius.lg,
    boxShadow: theme.shadow.card,
    boxSizing: 'border-box',
  },

  sectionCard: {
    background: theme.colors.cardBg,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    boxShadow: theme.shadow.soft,
    boxSizing: 'border-box',
  },

  title: {
    margin: 0,
    fontSize: theme.fontSizes.title,
    fontWeight: 700,
    color: theme.colors.text,
  },

  sectionTitle: {
    marginTop: 0,
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
    fontSize: theme.fontSizes.heading,
    fontWeight: 700,
  },

  subtitle: {
    marginTop: '10px',
    color: theme.colors.subtext,
    fontSize: theme.fontSizes.small,
  },

  input: {
    width: '100%',
    padding: '14px 16px',
    border: `1px solid ${theme.colors.inputBorder}`,
    borderRadius: theme.radius.sm,
    fontSize: theme.fontSizes.body,
    boxSizing: 'border-box',
    outline: 'none',
  },

  textarea: {
    width: '100%',
    minHeight: '90px',
    padding: '14px 16px',
    border: `1px solid ${theme.colors.inputBorder}`,
    borderRadius: theme.radius.sm,
    fontSize: theme.fontSizes.body,
    boxSizing: 'border-box',
    resize: 'vertical',
    outline: 'none',
  },

  select: {
    width: '100%',
    padding: '14px 16px',
    border: `1px solid ${theme.colors.inputBorder}`,
    borderRadius: theme.radius.sm,
    fontSize: theme.fontSizes.body,
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: theme.colors.white,
    color: theme.colors.text,

    // 👇 removes default browser styling
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',

    // 👇 adds custom dropdown arrow
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='%2340006a' viewBox='0 0 20 20'%3E%3Cpath d='M5.5 7l4.5 5 4.5-5z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '16px',

    cursor: 'pointer',
    },

  primaryButton: {
    background: theme.colors.primary,
    color: theme.colors.white,
    border: 'none',
    padding: '14px 16px',
    borderRadius: theme.radius.sm,
    fontSize: theme.fontSizes.body,
    fontWeight: 600,
    cursor: 'pointer',
  },

  secondaryButton: {
    background: theme.colors.secondary,
    color: theme.colors.white,
    border: 'none',
    padding: '12px 16px',
    borderRadius: theme.radius.sm,
    fontSize: theme.fontSizes.body,
    fontWeight: 600,
    cursor: 'pointer',
  },

  dangerButton: {
    background: theme.colors.danger,
    color: theme.colors.white,
    border: 'none',
    padding: '12px 16px',
    borderRadius: theme.radius.sm,
    fontSize: theme.fontSizes.body,
    fontWeight: 600,
    cursor: 'pointer',
  },

  errorBox: {
    background: theme.colors.errorBg,
    color: theme.colors.errorText,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    marginBottom: '18px',
    fontSize: theme.fontSizes.small,
  },

  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    flexWrap: 'wrap',
  },

  buttonRow: {
    display: 'flex',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },

  itemCard: {
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    background: theme.colors.itemBg,
    boxShadow: theme.shadow.soft,
  },
};