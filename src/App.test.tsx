import type { ReactNode } from 'react';
import { act, render, screen } from '@testing-library/react';
import { App } from './App';

// jsdom には WebGL がないので、Canvas と 3D の中身は差し替える
let onProgressChange: ((progress: number | null) => void) | undefined;

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: ReactNode }) => <div data-testid="canvas">{children}</div>,
}));

vi.mock('./TestGLTFComponent', () => ({
  TestGLTFComponent: (props: { onProgressChange?: (progress: number | null) => void }) => {
    onProgressChange = props.onProgressChange;
    return null;
  },
}));

describe('App', () => {
  beforeEach(() => {
    onProgressChange = undefined;
  });

  it('Canvas を表示し、最初は進捗バーを表示しない', () => {
    render(<App />);
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    expect(screen.queryByText('処理中...')).not.toBeInTheDocument();
  });

  it('読み込みの進捗が届くと進捗バーに反映される', () => {
    render(<App />);
    act(() => onProgressChange?.(0));
    expect(screen.getByText('0%')).toBeInTheDocument();
    act(() => onProgressChange?.(60));
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
  });

  it('処理が終わって null が届くと進捗バーが消える', () => {
    render(<App />);
    act(() => onProgressChange?.(100));
    expect(screen.getByText('処理中...')).toBeInTheDocument();
    act(() => onProgressChange?.(null));
    expect(screen.queryByText('処理中...')).not.toBeInTheDocument();
  });
});
