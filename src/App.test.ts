import { render, screen } from '@testing-library/react';
// @ts-expect-error TS(6142): Module './App' was resolved to '/home/ubuntu/proje... Remove this comment to see the full error message
import App from './App';

// @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
test('renders learn react link', () => {
  // @ts-expect-error TS(2749): 'App' refers to a value, but is being used as a ty... Remove this comment to see the full error message
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  // @ts-expect-error TS(2304): Cannot find name 'expect'.
  expect(linkElement).toBeInTheDocument();
});
