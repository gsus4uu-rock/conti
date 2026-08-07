# 그림 프롬프트 모음 (나노바나나용)

여기 프롬프트를 그대로 복사해서 이미지를 만들고, `game/art/` 안에 **정확한 파일명**으로 넣으면 됩니다.
넣는 즉시 게임에 반영됩니다. **한 장씩 넣어도 됩니다** — 없는 것은 원래 도트로 그려집니다.

---

## 먼저 읽어 주세요 (이게 제일 중요합니다)

### 1. 스타일 앵커를 반드시 매번 붙이세요

24장을 따로따로 만들면 화풍이 제각각이 됩니다. **아래 문단을 모든 프롬프트 앞에 똑같이 붙이는 것**이
전체를 한 게임처럼 보이게 하는 유일한 방법입니다. 한 글자도 바꾸지 마세요.

```
STYLE ANCHOR (keep identical for every image):
16-bit SNES-era JRPG pixel art, dark high fantasy. Chunky readable pixels as if
drawn on a small grid then enlarged — large square pixel blocks, hard clean edges,
no anti-aliasing on outlines, no blur, no airbrush. Limited palette of about 24
colors. Warm lantern-orange light against cool blue-grey shadow. Deep near-black
outlines. Subtle dithering for gradients. Painterly detailed pixel art in the
style of Chained Echoes, Sea of Stars, and Octopath Traveler sprites.
```

### 2. 캐릭터는 배경을 마젠타로

캐릭터·몬스터는 **배경이 순수 마젠타(#FF00FF)** 여야 합니다. 게임이 자동으로 지워서 투명하게 만듭니다.
"투명 배경"으로 달라고 하면 나노바나나가 흰색이나 체크무늬를 그려 버릴 때가 많아서, 마젠타가 훨씬 확실합니다.

> 게임이 알아서 처리하는 것: 마젠타 제거 → 여백 잘라내기 → 크기 맞추기 → 바닥에 세우기
> 그래서 **캐릭터가 화면 어디에 있든, 얼마나 크든 상관없습니다.**

### 3. 크기

| 종류 | 비율 | 권장 크기 |
|---|---|---|
| 캐릭터·몬스터 | 1:1 정사각형 | 1024 × 1024 |
| 배경 | 16:9 | 1920 × 1080 |

### 4. 배경은 위아래가 조금 잘립니다

게임은 **가로 전용**이고, 화면을 빈틈없이 채우기 위해 배경을 확대해서 자릅니다.
기기 비율에 따라 **위아래가 각각 최대 10%까지 잘릴 수 있습니다.**

→ 하늘의 중요한 것(달, 균열 등)이나 바닥의 중요한 것은 **너무 가장자리에 두지 마세요.**
   프롬프트에 이미 반영해 두었지만, 결과물을 볼 때 이 점을 확인하시면 됩니다.

### 5. 배경은 "빈 자리"를 남겨야 합니다

배경 위에 캐릭터가 올라갑니다. 그래서 배경 프롬프트에는 아래가 들어가 있습니다.

```
Ground/horizon line at about 62% down from the top.
Leave the center-right area and the lower-left area visually calm and uncluttered
so that game characters can be placed there. No characters, no creatures.
```

**이 문장을 지우지 마세요.** 지우면 배경에 있는 나무·바위 위에 몬스터가 겹쳐서 지저분해집니다.

### 6. 이 순서로 만드세요 (효과 큰 순서)

가장 자주 보이는 것부터 만들면 5장만으로도 확 달라집니다.

1. `hero_back.png` — 전투마다 계속 보입니다 ★★★
2. `bg/forest.png` — 제1장의 주무대 ★★★
3. `slime.png` `goblin.png` — 제일 많이 만나는 몬스터 ★★★
4. `bg/town.png` — 마을에 갈 때마다 ★★
5. `hero_front.png` — 마을·필드 ★★
6. 나머지 몬스터 → 보스 → NPC → 나머지 배경

---

# 캐릭터 · 몬스터  →  `game/art/spr/`

아래 문단을 **스타일 앵커 다음에** 붙이고, 그 뒤에 각 캐릭터 설명을 붙이세요.

```
FRAMING (keep identical for every character):
One single character, full body, centered, complete idle standing pose.
Background is 100% pure flat magenta #FF00FF — absolutely uniform, no gradient,
no vignette, no ground, no platform, no cast shadow, no glow spill onto the
background. No text, no UI, no frame, no border, no watermark, no signature.
Square 1:1 image.
```

---

### `hero_front.png` — 주인공 (앞모습)

```
A 15-year-old boy adventurer seen from the FRONT, facing the viewer.
Messy brown hair, determined but slightly nervous young face, simple worn linen
shirt under a cheap patched leather vest, cloth trousers, scuffed boots.
He holds a plain wooden stick like a sword in his right hand — deliberately poor
equipment, he is a beginner who owns nothing. Small leather satchel at his hip.
Heroic but humble silhouette. Warm sunlight from the upper left.
```

### `hero_back.png` — 주인공 (뒷모습, 전투용) ★가장 중요

```
The SAME 15-year-old boy adventurer seen from BEHIND, back view, facing away from
the viewer into the distance, standing ready for battle.
Same messy brown hair from behind, same patched leather vest and cloth trousers,
same small leather satchel. His right arm is lowered holding a plain wooden stick
like a sword. Shoulders slightly tense. We never see his face.
Warm light from the upper left, long shadow direction to the lower right.
Match the exact same character design, colors and proportions as hero_front.
```

### `slime.png` — 슬라임

```
A small round gelatinous green slime monster, glossy translucent body with a
lighter highlight arc across the top, two tiny dark simple eyes and a small mouth.
Slightly squashed blob shape, a couple of drips at the base. Harmless and a little
cute rather than scary — this is the very first enemy a beginner fights.
```

### `rat.png` — 들쥐

```
A large aggressive grey field rat the size of a dog, crouched low on all fours,
seen from a three-quarter side view. Matted grey-brown fur, long pink naked tail
curling behind, yellow chisel teeth bared, small red eyes, torn ear.
Dirty and quick-looking, a nuisance rather than a monster.
```

### `hornrabbit.png` — 뿔토끼

```
A wild rabbit monster the size of a large dog with a single sharp ivory horn
growing from its forehead. Thick cream-and-brown fur, powerful hind legs coiled to
charge, long ears laid back, fierce red eyes. Deceptively cute face, dangerous horn.
Three-quarter view, alert charging stance.
```

### `goblin.png` — 고블린

```
A scrawny green-skinned goblin, about the height of a child, standing in a
three-quarter view. Long pointed ears, big crooked nose, yellow eyes, sharp teeth
in a nasty grin. Filthy loincloth and a scrap-leather shoulder pad, bare feet.
Holds a crude rusty dagger in one hand. Wiry, mean, cowardly-looking.
```

### `spider.png` — 숲거미

```
A large forest spider monster the size of a big dog, seen from a slightly elevated
front angle. Eight long jointed legs spread wide, bulbous abdomen with a pale
yellow hourglass marking, dark purple-black chitin with a faint sheen, cluster of
six glossy yellow eyes, dripping fangs. Wisps of web on its legs.
```

### `wolf.png` — 회색늑대

```
A lean grey timber wolf monster in a three-quarter side view, head lowered in a
stalking posture, hackles raised. Shaggy grey-and-white winter coat, cold pale
amber eyes, bared white fangs, breath steaming. Muscular and hungry, not a pet.
```

### `kobold.png` — 코볼트

```
A kobold: a small upright lizard-dog humanoid miner, brown scaly hide, snouted
reptilian face with amber eyes, short horns, ragged ear frills. Wears a battered
miner's helmet with a dim lamp and a rope belt with tools. Grips a heavy iron
pickaxe like a weapon. Hunched, wary, territorial. Three-quarter view.
```

### `bat.png` — 동굴박쥐

```
A giant cave bat with a wingspan much wider than its body, seen from the front in
mid-flight with wings spread wide and open. Dark purple-black leathery wings with
visible finger bones, small furred body, huge ears, glowing red eyes, tiny sharp
fangs, snub nose. Motion feels fast and erratic.
```

### `golem.png` — 돌골렘

```
A stone golem the height of two men, built of rough grey granite blocks held
together by faintly glowing cyan runes in the seams. Blocky heavy build, massive
fists, thick stubby legs, no neck. A single glowing cyan slit for eyes.
Standing still and immovable, moss and mine dust on its shoulders.
```

---

## 보스 3종

보스는 일반 몬스터보다 **화면에서 더 크게** 나옵니다. 위압감이 느껴지게 그려 주세요.

### `boss_goblin.png` — 고블린 두목 그로쉬

```
A goblin CHIEFTAIN, one head taller and far broader than a normal goblin, heavily
muscled for his kind. Dark olive-green skin covered in tribal war paint and old
scars, a crown of animal bones and feathers, necklace of teeth. Wears looted
mismatched armour pieces from fallen adventurers. Wields a huge notched two-handed
axe resting on one shoulder. Cruel intelligent yellow eyes, a commanding sneer.
Imposing boss presence, low intimidating stance.
```

### `boss_spider.png` — 숲의 어미 아라크나

```
A colossal matriarch spider, an ancient forest broodmother. Massive bulbous abdomen
patterned with pale glowing runes, eight enormous armoured legs raised high and
angular, deep violet-black chitin with iridescent highlights. Ten burning yellow
eyes in two rows. Silk strands trail from her legs, tiny spiderlings clustered on
her back. Terrifying, regal, ancient. Front view, legs framing the body.
```

### `boss_golem.png` — 광산의 수호자

```
A colossal ancient stone guardian golem, far larger and more ornate than a common
golem. Carved from dark granite with weathered geometric relief patterns, cracked
plates held by molten orange energy in the seams. A large glowing STAR-SHAPED
sigil carved into the centre of its chest, radiating pale cyan light. Broad
shoulders, enormous fists, glowing cyan eye slit. Standing sentinel, unmoving,
mine dust falling from its arms. Overwhelming scale and weight.
```

---

## 마왕 (오프닝 꿈 장면)

### `neros.png` — 마왕 네로스

이 게임의 **최종 목표**입니다. 오프닝 꿈에서 딱 한 번 나오고, 아이가 "언젠가 저걸 이겨야 한다"고
느끼게 만드는 그림입니다. 제일 공들여 만들 가치가 있습니다.

```
NEROS, the sealed Demon King — a towering demonic overlord, mountain-sized
presence. Immense horned silhouette: two enormous curved black horns sweeping back
from a shadowed skull-like face, only two burning crimson eyes and a slit of a
mouth visible inside the darkness. Vast tattered black wings spread wide behind
him. Body of black obsidian armour plating with molten crimson cracks glowing
between the plates, like cooling lava. Long clawed arms. Wisps of red-violet
energy bleeding off his form.
Absolutely overwhelming, ancient, patient evil — he is not lunging, he is simply
standing and looking down at you, which is more frightening.
```

---

## 마을 사람 3종

### `elder.png` — 촌장

```
An old village elder, kind and weathered. Long white beard, bald crown with white
hair at the sides, deep laugh lines, gentle tired eyes. Simple brown-and-cream
robe with a rope belt, leaning on a gnarled wooden walking staff. Slightly stooped,
warm and grandfatherly. Front view, standing.
```

### `merchant.png` — 상인

```
A travelling merchant, middle-aged and shrewd. Round friendly face with a
well-trimmed moustache and a knowing smile, orange-brown coat over a yellow tunic,
wide belt with pouches, a heavy pack of goods strapped to his back and a scale
hanging from his hip. One hand open in a "come, take a look" gesture.
Front view, standing.
```

### `guard.png` — 노기사 / 병사

```
An old veteran knight in worn steel plate armour, helmet off and held under one
arm. Grey stubble, scarred weathered face, tired but unbroken eyes. The armour is
dented and scorched, the blue surcoat faded and torn. A longsword sheathed at his
hip, one hand resting on the pommel. He has clearly survived something terrible.
Front view, standing, dignified and weary.
```

---

# 배경  →  `game/art/bg/`

아래 문단을 **스타일 앵커 다음에** 붙이세요.

```
FRAMING (keep identical for every background):
Wide 16:9 game battle background, no characters, no creatures, no people.
Ground/horizon line at about 62% down from the top; the bottom 38% is open
walkable ground. Leave the center-right area and the lower-left area visually
calm and uncluttered so that game characters can be placed there.
Keep all important elements away from the extreme top and bottom edges — the
outer 10% of the top and bottom may be cropped. Nothing essential in those bands.
No text, no UI, no frame, no border, no watermark, no vignette.
```

---

### `bg/plains.png` — 마을 뒷들판 (초보자 사냥터)

```
A peaceful sunlit meadow just outside a small village. Rolling green grass with
wildflowers, a low stone wall and a wooden fence along the left edge, golden wheat
fields and a distant village rooftop with chimney smoke on the far horizon.
Bright blue sky with soft white clouds. Warm midday light. Safe, gentle, the very
first place a young adventurer fights.
```

### `bg/forest.png` — 속삭이는 숲 ★가장 중요

```
A dense ancient forest clearing at dusk. Tall dark pine and oak trunks crowding
both sides and the far background, thick canopy overhead letting only a few pale
shafts of light through. Mossy roots and ferns along the edges, drifting mist and
faint floating spores. Cool blue-green shadow with a single warm shaft of amber
light breaking through. Quietly ominous — the trees feel like they are listening.
```

### `bg/mine.png` — 무너진 광산

```
The inside of a long-abandoned collapsed mine shaft. Rough dark rock walls,
broken wooden support beams and a snapped mine cart rail along the left edge,
rubble and fallen stone. Stalactites hanging from the ceiling at the top of the
frame. Veins of faintly glowing cyan crystal in the walls, one dying orange lantern
hooked on a beam. Deep cold darkness beyond. Claustrophobic and long-dead.
```

### `bg/town.png` — 벨라온 마을

```
A small poor farming village square at golden hour. Three or four modest cottages
with thatched and red-tile roofs and warm glowing windows, a dirt path running
through the middle, a stone well to one side, wooden fences, barrels and hanging
laundry. Distant wheat fields and low hills behind. Warm orange sunset light,
smoke curling from chimneys. Humble, safe, and deeply homely — this is home.
```

### `bg/night.png` — 밤 (야영·운명 이벤트)

```
A wild open campsite at deep night under an enormous starfield. Dark rolling
grassland, silhouettes of distant hills and a few bare trees at the edges, a large
pale moon low in the sky. Cool deep blue and indigo tones with faint starlight on
the grass. Vast, quiet, and slightly lonely — the kind of night where something
important happens.
```

### `bg/ruin.png` — 폐허 / 하늘의 상처

```
A desolate ruined plateau of ancient shattered stone pillars and broken flagstones
under a bruised purple-red sky. In the upper sky, a huge jagged CRACK torn in the
heavens itself, bleeding crimson light down over the landscape — the "Sky Scar".
Broken statues and a fallen archway along the far edges, drifting ash.
Apocalyptic, sacred, and very old. This is where the world was wounded.
```

---

## 잘 안 나올 때

| 증상 | 이렇게 해 보세요 |
|---|---|
| 그림이 너무 매끈하다 (도트가 아님) | 스타일 앵커에 `large square pixel blocks, visible individual pixels, aliased hard edges` 를 한 번 더 강조 |
| 배경이 마젠타가 아니다 | `The background must be solid RGB(255,0,255) magenta and nothing else.` 를 맨 뒤에 추가 |
| 캐릭터가 잘렸다 | `full body visible with margin on all four sides, nothing cropped` 추가 |
| 화풍이 앞의 것과 다르다 | 앞서 만든 그림을 같이 올리고 `match this exact art style and palette` 라고 지시 |
| 글자·워터마크가 들어갔다 | `absolutely no text or lettering anywhere in the image` 추가 |

**화풍 통일 요령**: 가장 마음에 드는 한 장(예: `hero_back`)을 먼저 완성한 뒤,
나머지를 만들 때 **그 이미지를 첨부하고** "이 그림과 같은 화풍·같은 팔레트로" 라고 지시하면
훨씬 잘 맞습니다. 나노바나나는 이미지 참조를 잘 따릅니다.

---

## 넣는 방법

1. 만든 PNG를 `game/art/spr/` 또는 `game/art/bg/` 에 위 파일명 그대로 저장
2. 커밋 & 푸시
3. 끝 — 게임에서 바로 보입니다

> ⚠️ 게임은 **가로 화면 전용**입니다. 세로로 들면 "돌려 주세요" 안내가 뜹니다.
>
> ⚠️ 그림은 **GitHub Pages 주소로 열었을 때** 완전하게 처리됩니다.
> 파일을 그냥 더블클릭해서 열면(`file://`) 브라우저 보안 때문에 마젠타 제거가 안 됩니다.
> 아이들은 어차피 Pages 주소로 할 테니 문제없지만, 확인하실 때 참고하세요.
