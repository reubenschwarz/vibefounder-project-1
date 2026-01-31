"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "@/hooks/use-session";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CVP_WORD_LIMITS, type CvpFields } from "@/lib/schemas/session";

type FieldKey = keyof CvpFields;

const FIELDS: { key: FieldKey; label: string; placeholder: string }[] = [
  {
    key: "forWho",
    label: "For",
    placeholder: "Who is the target customer?",
  },
  {
    key: "inSituation",
    label: "In situation",
    placeholder: "What situation or context are they in?",
  },
  {
    key: "strugglesWith",
    label: "Who struggles with",
    placeholder: "What problem or pain do they face?",
  },
  {
    key: "currentWorkaround",
    label: "Current workaround",
    placeholder: "How do they solve it today?",
  },
  {
    key: "weOffer",
    label: "We offer",
    placeholder: "What is your product or service?",
  },
  {
    key: "soTheyGet",
    label: "So they get",
    placeholder: "What outcome or benefit do they receive?",
  },
  {
    key: "unlike",
    label: "Unlike",
    placeholder: "What alternatives or competitors exist?",
  },
  {
    key: "because",
    label: "Because",
    placeholder: "What is your unique differentiation?",
  },
];

function wordCount(s: string): number {
  return s.trim() === "" ? 0 : s.trim().split(/\s+/).length;
}

export function CvpForm({
  initialData,
  onSaved,
}: {
  initialData: CvpFields;
  onSaved?: () => void;
}) {
  const session = useSession();
  const [values, setValues] = useState<Record<FieldKey, string>>(() => {
    const v: Record<string, string> = {};
    for (const f of FIELDS) {
      v[f.key] = initialData[f.key] ?? "";
    }
    return v as Record<FieldKey, string>;
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [dirty, setDirty] = useState(false);

  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<FieldKey, string>> = {};
    let valid = true;
    for (const f of FIELDS) {
      const wc = wordCount(values[f.key]);
      const limit = CVP_WORD_LIMITS[f.key];
      if (wc > limit) {
        newErrors[f.key] = `${wc}/${limit} words — over limit`;
        valid = false;
      }
    }
    setErrors(newErrors);
    return valid;
  }, [values]);

  const handleChange = useCallback((key: FieldKey, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/s/${session.id}/cvp`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Save failed");
      }
      setDirty(false);
      onSaved?.();
    } finally {
      setSaving(false);
    }
  }, [session.id, values, validate, onSaved]);

  // Auto-save on blur with debounce
  const [pendingSave, setPendingSave] = useState(false);
  useEffect(() => {
    if (!pendingSave || !dirty) return;
    setPendingSave(false);
    handleSave();
  }, [pendingSave, dirty, handleSave]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Value Proposition</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-5"
        >
          {FIELDS.map((field) => {
            const wc = wordCount(values[field.key]);
            const limit = CVP_WORD_LIMITS[field.key];
            const overLimit = wc > limit;

            return (
              <div key={field.key} className="space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <span
                    className={`text-xs ${overLimit ? "text-red-500 font-medium" : "text-zinc-400"}`}
                  >
                    {wc}/{limit} words
                  </span>
                </div>
                <Textarea
                  id={field.key}
                  placeholder={field.placeholder}
                  value={values[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  onBlur={() => {
                    if (dirty) setPendingSave(true);
                  }}
                  rows={2}
                  className={overLimit ? "border-red-500" : ""}
                />
                {errors[field.key] && (
                  <p className="text-xs text-red-500">{errors[field.key]}</p>
                )}
              </div>
            );
          })}

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
            {!dirty && (
              <span className="text-xs text-zinc-400">All changes saved</span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
