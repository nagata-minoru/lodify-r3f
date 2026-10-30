import type { ReactNode } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

// jsdom には WebGL がないので、Canvas と 3D の中身は差し替える
let onProgressChange: ((progress: number | null) => void) | undefined;
let filePath: string | undefined;

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: ReactNode }) => <div data-testid="canvas">{children}</div>,
}));

vi.mock('./TestGLTFComponent', () => ({
  TestGLTFComponent: (props: { filePath: string, onProgressChange?: (progress: number | null) => void }) => {
    filePath = props.filePath;
    onProgressChange = props.onProgressChange;
    return null;
  },
}));

describe('App', () => {
  beforeEach(() => {
    onProgressChange = undefined;
    filePath = undefined;
  });

  it('最初は先頭のモデルを読み込む', () => {
    render(<App />);
    expect(screen.getByLabelText('モデル')).toHaveValue('human_head.glb');
    expect(filePath).toBe('human_head.glb');
  });

  it('モデルを選ぶと、そのモデルを読み込む', async () => {
    render(<App />);
    await userEvent.selectOptions(screen.getByLabelText('モデル'), 'Box.glb');
    expect(screen.getByLabelText('モデル')).toHaveValue('Box.glb');
    expect(filePath).toBe('Box.glb');
  });

  it('処理中はモデルを切り替えられず、終わると切り替えられる', () => {
    render(<App />);
    act(() => onProgressChange?.(30));
    expect(screen.getByLabelText('モデル')).toBeDisabled();
    act(() => onProgressChange?.(null));
    expect(screen.getByLabelText('モデル')).toBeEnabled();
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
