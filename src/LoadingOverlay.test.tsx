import { render, screen } from '@testing-library/react';
import { LoadingOverlay } from './LoadingOverlay';

describe('LoadingOverlay', () => {
  it('progress が null のときは何も表示しない', () => {
    const { container } = render(<LoadingOverlay progress={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('処理中のメッセージとパーセントを表示する', () => {
    render(<LoadingOverlay progress={42} />);
    expect(screen.getByText('処理中...')).toBeInTheDocument();
    expect(screen.getByText('42%')).toBeInTheDocument();
  });

  it('プログレスバーの幅が progress に一致する', () => {
    const { container } = render(<LoadingOverlay progress={75} />);
    expect(container.querySelector('.progress-bar-fill')).toHaveStyle({ width: '75%' });
  });

  it('0% でも表示する(null と区別する)', () => {
    render(<LoadingOverlay progress={0} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('100% でも表示する', () => {
    const { container } = render(<LoadingOverlay progress={100} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(container.querySelector('.progress-bar-fill')).toHaveStyle({ width: '100%' });
  });
});
