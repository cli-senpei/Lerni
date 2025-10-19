import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { PerformanceSample } from "@/lib/adaptiveAI";

interface PhaserGameProps {
  userName: string;
  points: number;
  gameType: "word-catch" | "letter-jump" | "phonics-runner";
  targetWords?: string[];
  difficulty?: "easy" | "medium" | "hard";
  onPointsEarned: (amount: number) => void;
  onExitToChat: () => void;
  onPerformanceRecord?: (sample: PerformanceSample) => Promise<void>;
}

const PhaserGame = ({
  userName,
  points,
  gameType,
  targetWords = [],
  difficulty = "medium",
  onPointsEarned,
  onExitToChat,
}: PhaserGameProps) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    if (!gameRef.current || phaserGameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: 800,
      height: 600,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 300 },
          debug: false,
        },
      },
      scene: {
        preload: function (this: Phaser.Scene) {
          // Load assets
          this.load.setBaseURL('https://labs.phaser.io');
          this.load.image('sky', 'assets/skies/space3.png');
          this.load.image('star', 'assets/sprites/star.png');
          this.load.image('bomb', 'assets/sprites/bomb.png');
          this.load.spritesheet('dude', 'assets/sprites/dude.png', {
            frameWidth: 32,
            frameHeight: 48,
          });
        },
        create: function (this: Phaser.Scene) {
          const scene = this;
          
          // Background
          this.add.image(400, 300, 'sky');
          
          // Platform group
          const platforms = this.physics.add.staticGroup();
          platforms.create(400, 568, 'star').setScale(2).refreshBody();
          platforms.create(600, 400, 'star');
          platforms.create(50, 250, 'star');
          platforms.create(750, 220, 'star');

          // Player
          const player = this.physics.add.sprite(100, 450, 'dude');
          player.setBounce(0.2);
          player.setCollideWorldBounds(true);

          // Animations
          this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1,
          });

          this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20,
          });

          this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1,
          });

          // Collisions
          this.physics.add.collider(player, platforms);

          // Words/Stars to collect
          const words = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 },
          });

          words.children.iterate((child) => {
            const word = child as Phaser.Physics.Arcade.Sprite;
            word.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
            return true;
          });

          this.physics.add.collider(words, platforms);

          // Collect words
          let score = 0;
          const scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '32px',
            color: '#fff',
          });

          this.physics.add.overlap(
            player,
            words,
            function (player, word) {
              (word as Phaser.Physics.Arcade.Sprite).disableBody(true, true);
              score += 10;
              scoreText.setText('Score: ' + score);
              setGameScore(score);

              if (words.countActive(true) === 0) {
                words.children.iterate((child) => {
                  const word = child as Phaser.Physics.Arcade.Sprite;
                  word.enableBody(true, word.x, 0, true, true);
                  return true;
                });

                // Add bombs
                const x = Phaser.Math.Between(0, 800);
                const bomb = bombs.create(x, 16, 'bomb');
                bomb.setBounce(1);
                bomb.setCollideWorldBounds(true);
                bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
              }
            },
            undefined,
            this
          );

          // Bombs group
          const bombs = this.physics.add.group();
          this.physics.add.collider(bombs, platforms);
          this.physics.add.collider(
            player,
            bombs,
            function () {
              scene.physics.pause();
              player.setTint(0xff0000);
              player.anims.play('turn');
              setIsGameOver(true);
            },
            undefined,
            this
          );

          // Controls
          const cursors = this.input.keyboard?.createCursorKeys();

          // Game loop
          this.events.on('update', () => {
            if (!cursors) return;

            if (cursors.left?.isDown) {
              player.setVelocityX(-160);
              player.anims.play('left', true);
            } else if (cursors.right?.isDown) {
              player.setVelocityX(160);
              player.anims.play('right', true);
            } else {
              player.setVelocityX(0);
              player.anims.play('turn');
            }

            if (cursors.up?.isDown && player.body?.touching.down) {
              player.setVelocityY(-330);
            }
          });

          // Instructions
          const instructions = this.add.text(400, 50, 'Use Arrow Keys to Move!', {
            fontSize: '24px',
            color: '#fff',
            backgroundColor: '#000',
            padding: { x: 10, y: 5 },
          });
          instructions.setOrigin(0.5);
        },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    phaserGameRef.current = new Phaser.Game(config);

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isGameOver && gameScore > 0) {
      const pointsEarned = Math.floor(gameScore / 2);
      onPointsEarned(pointsEarned);
    }
  }, [isGameOver, gameScore]);

  const getGameTitle = () => {
    switch (gameType) {
      case "word-catch":
        return "Word Catch";
      case "letter-jump":
        return "Letter Jump";
      case "phonics-runner":
        return "Phonics Runner";
      default:
        return "Learning Game";
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-blue-50 via-background to-purple-50 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">{getGameTitle()}</h2>
          <p className="text-sm text-muted-foreground">
            Collect the stars and avoid the bombs!
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <Star className="w-4 h-4 text-primary" />
            <span className="font-bold">{gameScore}</span>
          </div>
          <Button onClick={onExitToChat} variant="ghost" size="sm">
            Exit Game
          </Button>
        </div>
      </div>

      {/* Game Container */}
      <div className="flex-1 flex items-center justify-center">
        <div 
          ref={gameRef} 
          className="rounded-xl border-4 border-white shadow-2xl overflow-hidden bg-black"
          style={{ maxWidth: '800px', maxHeight: '600px' }}
        />
      </div>

      {/* Game Over Screen */}
      {isGameOver && (
        <div className="mt-4 bg-background/80 backdrop-blur-sm rounded-lg p-6 border shadow-sm text-center animate-fade-in">
          <h3 className="text-2xl font-bold mb-2">Game Over!</h3>
          <p className="text-lg mb-4">
            Great job, {userName}! You earned {Math.floor(gameScore / 2)} points! 🎮
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => window.location.reload()}>
              Play Again
            </Button>
            <Button onClick={onExitToChat} variant="outline">
              Back to Chat
            </Button>
          </div>
        </div>
      )}

      {/* Controls Info */}
      <div className="mt-4 bg-background/60 backdrop-blur-sm rounded-lg p-4 border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl mb-1">←→</div>
            <div className="text-xs text-muted-foreground">Move Left/Right</div>
          </div>
          <div>
            <div className="text-2xl mb-1">↑</div>
            <div className="text-xs text-muted-foreground">Jump</div>
          </div>
          <div>
            <div className="text-2xl mb-1">⭐</div>
            <div className="text-xs text-muted-foreground">Collect Stars</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhaserGame;
