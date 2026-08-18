# OG image fonts

Static TTF instances of the site's variable woff2 fonts, used only by
`app/og-card.tsx` when generating the social share image at build time.

They exist because satori — the renderer behind `next/og` — cannot decode
woff2, and does not resolve variable font axes. Each file is one pinned
weight instance:

| File                    | Source                            | Axis      |
| ----------------------- | --------------------------------- | --------- |
| `Archivo-800.ttf`       | `../Archivo-latin.woff2`          | wght=800  |
| `Archivo-400.ttf`       | `../Archivo-latin.woff2`          | wght=400  |
| `JetBrainsMono-400.ttf` | `../JetBrainsMono-latin.woff2`    | wght=400  |

Regenerate with fontTools if the source fonts ever change:

```python
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

f = TTFont("app/fonts/Archivo-latin.woff2")
f.flavor = None
f = instancer.instantiateVariableFont(f, {"wght": 800}, inplace=False)
f.flavor = None
f.save("app/fonts/og/Archivo-800.ttf")
```

The browser still loads the woff2 files; these are build-time only and are
never served to visitors.
