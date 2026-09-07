import Icon from './Icon';

export default function StarRating({ rating, size = 16, onChange }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-0.5">
      {stars.map((s) => (
        <button
          type="button"
          key={s}
          disabled={!onChange}
          onClick={() => onChange && onChange(s)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
        >
          <Icon
            name="star"
            filled={s <= rating}
            className={s <= rating ? 'text-brass' : 'text-outline-variant'}
            style={{ fontSize: size }}
          />
        </button>
      ))}
    </div>
  );
}
