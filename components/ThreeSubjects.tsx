import React from 'react';

export const SUBJECTS = ["Toán", "Tiếng Anh"] as const;
export type Subject = typeof SUBJECTS[number];

// FIX: Used Omit to remove the original 'onChange' from HTMLSelectElement attributes to avoid type intersection conflicts with the custom 'onChange' prop.
type SubjectSelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> & {
  value: Subject;
  onChange: (v: Subject) => void;
  className?: string;
};

export function SubjectSelect({ value, onChange, className = "px-3 py-2 border rounded-xl", ...rest }: SubjectSelectProps){
  return (
    <select
      {...rest}
      className={className}
      value={value}
      onChange={(e)=> onChange(e.target.value as Subject)}
    >
      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}
