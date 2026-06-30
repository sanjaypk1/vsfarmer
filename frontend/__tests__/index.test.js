import { render, screen } from '@testing-library/react';
import Home from '../pages/index';

describe('Home page', () => {
  it('renders the Farmers Market heading', () => {
    render(<Home />);
    expect(screen.getByText(/Farmers Market/i)).toBeInTheDocument();
  });
});
