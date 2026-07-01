import { render, screen } from '@testing-library/react';
import Home from '../pages/index';

describe('Home page', () => {
  it('renders the hero content for the redesigned marketplace', () => {
    render(<Home />);
    expect(screen.getByText(/agri essentials/i)).toBeInTheDocument();
    expect(screen.getByText(/today's offers/i)).toBeInTheDocument();
  });
});
