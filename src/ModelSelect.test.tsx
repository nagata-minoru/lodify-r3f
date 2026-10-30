import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MODELS, ModelSelect } from './ModelSelect';

describe('ModelSelect', () => {
  it('選べるモデルをすべて表示し、value のモデルを選択している', () => {
    render(<ModelSelect value="Box.glb" onChange={() => {}} />);
    const options = screen.getAllByRole('option');
    expect(options.map((o) => o.getAttribute('value'))).toEqual(MODELS.map((m) => m.filePath));
    expect(screen.getByLabelText('モデル')).toHaveValue('Box.glb');
  });

  it('モデルを選ぶと onChange にファイルパスを渡す', async () => {
    const onChange = vi.fn();
    render(<ModelSelect value="human_head.glb" onChange={onChange} />);
    await userEvent.selectOptions(screen.getByLabelText('モデル'), 'Box.glb');
    expect(onChange).toHaveBeenCalledWith('Box.glb');
  });

  it('disabled を渡すと select が無効になる', () => {
    render(<ModelSelect value="human_head.glb" disabled onChange={() => {}} />);
    expect(screen.getByLabelText('モデル')).toBeDisabled();
  });
});
