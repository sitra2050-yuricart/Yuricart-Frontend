import { Label } from "@/components/ui/label";
import { checkInStock, cn } from "@/lib/utils";
import { LegacyProductDetail } from "@/lib/api/adapters";

interface ProductOptionsProps {
  product: LegacyProductDetail;
  selectedOptions: Record<string, string>;
  setSelectedOptions: (options: Record<string, string>) => void;
}

export default function ProductOptions({
  product,
  selectedOptions,
  setSelectedOptions,
}: ProductOptionsProps) {
  return (
    <div className="space-y-3">
      {product.productOptions?.map((option) => (
        <fieldset key={option.name} className="space-y-2">
          <legend>
            <Label asChild>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {option.name}
              </span>
            </Label>
          </legend>
          <div className="flex flex-wrap items-center gap-1.5">
            {option.choices?.map((choice) => (
              <div key={choice.description}>
                <input
                  type="radio"
                  id={choice.description}
                  name={option.name}
                  value={choice.description}
                  checked={
                    selectedOptions[option.name || ""] === choice.description
                  }
                  onChange={() =>
                    setSelectedOptions({
                      ...selectedOptions,
                      [option.name || ""]: choice.description || "",
                    })
                  }
                  className="peer hidden"
                />
                <Label
                  htmlFor={choice.description}
                  className={cn(
                    "flex min-w-14 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 transition hover:border-[#003B73] peer-checked:border-[#003B73] peer-checked:bg-[#003B73] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#003B73]/40",
                    !checkInStock(product, {
                      ...selectedOptions,
                      [option.name || ""]: choice.description || "",
                    }) && "line-through opacity-50",
                  )}
                >
                  <span>{choice.description}</span>
                </Label>
              </div>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
