// @ts-nocheck -- Presentation-only runtime polish for the Act I onboarding card.
import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

function polishIntroCard(scene: SceneLike) {
  const card = scene.__introTutorialCard as Phaser.GameObjects.Text | undefined;
  if (!card?.active || card.getData?.("premium-intro-ui")) return;

  card.setData?.("premium-intro-ui", true);
  card.setText("Talk to Wren first\nCharacters guide the story and reveal what matters next.");
  card.setStyle?.({
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: "12px",
    fontStyle: "normal",
    align: "left",
    color: "#f5ead1",
    backgroundColor: "rgba(9, 22, 39, 0.92)",
    padding: { x: 15, y: 11 },
    wordWrap: { width: 320 },
    lineSpacing: 4,
  });
  card.setStroke?.("#09111c", 1);
  card.setOrigin?.(0.5, 0);
  card.setAlpha?.(0.96);
  card.setPosition?.((scene.scale?.width ?? 800) / 2, 122);
}

export function installIntroUiPolish(QuestScene: SceneCtor) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__introUiPolishInstalled) return;
  proto.__introUiPolishInstalled = true;

  const originalUpdate = proto.update;
  proto.update = function introUiPolishUpdate(this: SceneLike, ...args: any[]) {
    const result = originalUpdate?.apply(this, args);
    polishIntroCard(this);
    return result;
  };
}
