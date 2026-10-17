import type { HTMLAttributes } from "react";
export function Table({ ...props }: HTMLAttributes<HTMLTableElement>) { return <table className="w-full border-collapse text-left" {...props} />; }
