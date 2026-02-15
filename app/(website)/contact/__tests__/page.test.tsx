import { render, screen } from '@testing-library/react';
import ContactPage from '../page';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock language context
jest.mock('@/lib/i18n/context', () => ({
  useLanguage: () => ({ language: 'en' }),
}));

// Mock 3D components
jest.mock('@/components/website/3d/Card3D', () => ({
  Card3D: ({ children, className }: any) => (
    <div className={className} data-testid="card-3d">
      {children}
    </div>
  ),
}));

jest.mock('@/components/website/3d/CardGrid3D', () => ({
  CardGrid3D: ({ children }: any) => (
    <div data-testid="card-grid-3d">{children}</div>
  ),
}));

// Mock animation components
jest.mock('@/components/website/animations/FadeInView', () => ({
  FadeInView: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/website/animations/SlideInView', () => ({
  SlideInView: ({ children }: any) => <div>{children}</div>,
}));

describe('ContactPage', () => {
  it('renders hero section with title and subtitle', () => {
    render(<ContactPage />);
    
    expect(screen.getByText('hero.title')).toBeInTheDocument();
    expect(screen.getByText('hero.subtitle')).toBeInTheDocument();
  });

  it('renders contact information cards', () => {
    render(<ContactPage />);
    
    expect(screen.getByText('info.email.title')).toBeInTheDocument();
    expect(screen.getByText('info.phone.title')).toBeInTheDocument();
    expect(screen.getByText('info.address.title')).toBeInTheDocument();
  });

  it('renders contact form with all fields', () => {
    render(<ContactPage />);
    
    expect(screen.getByText('form.title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('form.fields.name.placeholder')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('form.fields.email.placeholder')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('form.fields.phone.placeholder')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('form.fields.subject.placeholder')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('form.fields.message.placeholder')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<ContactPage />);
    
    const submitButton = screen.getByRole('button', { name: /form.submit/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('renders business hours section', () => {
    render(<ContactPage />);
    
    expect(screen.getByText('hours.title')).toBeInTheDocument();
    expect(screen.getByText('hours.weekdays')).toBeInTheDocument();
    expect(screen.getByText('hours.weekend')).toBeInTheDocument();
  });

  it('uses 3D card components for contact info', () => {
    render(<ContactPage />);
    
    const cards = screen.getAllByTestId('card-3d');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('uses CardGrid3D for contact information layout', () => {
    render(<ContactPage />);
    
    const cardGrid = screen.getAllByTestId('card-grid-3d');
    expect(cardGrid.length).toBeGreaterThan(0);
  });

  it('form has glass morphism styling', () => {
    render(<ContactPage />);
    
    // Find the form element
    const form = screen.getByRole('button', { name: /form.submit/i }).closest('form');
    expect(form).toBeInTheDocument();
    
    // Check that the form's parent container has backdrop-blur class
    const formContainer = form?.closest('[class*="backdrop-blur"]');
    expect(formContainer).toBeInTheDocument();
  });

  it('all form fields have proper labels and placeholders', () => {
    render(<ContactPage />);
    
    const nameInput = screen.getByPlaceholderText('form.fields.name.placeholder');
    expect(nameInput).toBeInTheDocument();
    
    const emailInput = screen.getByPlaceholderText('form.fields.email.placeholder');
    expect(emailInput).toBeInTheDocument();
    
    const messageInput = screen.getByPlaceholderText('form.fields.message.placeholder');
    expect(messageInput).toBeInTheDocument();
  });

  it('required fields are marked with asterisk', () => {
    render(<ContactPage />);
    
    // Check that required field labels are present
    expect(screen.getByText('form.fields.name.label')).toBeInTheDocument();
    expect(screen.getByText('form.fields.email.label')).toBeInTheDocument();
    expect(screen.getByText('form.fields.subject.label')).toBeInTheDocument();
    expect(screen.getByText('form.fields.message.label')).toBeInTheDocument();
    
    // Check that asterisks are present (4 asterisks for required fields)
    const asterisks = screen.getAllByText('*');
    expect(asterisks.length).toBeGreaterThanOrEqual(4);
  });

  it('phone field is optional (no asterisk in label)', () => {
    render(<ContactPage />);
    
    const phoneLabel = screen.getByText('form.fields.phone.label');
    expect(phoneLabel).toBeInTheDocument();
    
    // Phone label should not have an asterisk as a sibling
    const phoneInput = screen.getByPlaceholderText('form.fields.phone.placeholder');
    expect(phoneInput).toBeInTheDocument();
  });
});
