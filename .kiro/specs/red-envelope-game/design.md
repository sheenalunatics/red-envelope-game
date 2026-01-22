# Design Document

## Overview

เกมสุ่มเปิดซองแดงอั่งเปาจีนเป็น web application ที่ใช้ HTML5, CSS3, และ JavaScript ในการสร้างประสบการณ์การเล่นเกมที่น่าสนใจ ระบบจะประกอบด้วยหน้าจอการตั้งค่า หน้าจอเกม และระบบการจัดการสถานะเกม

## Architecture

ระบบจะใช้ Client-side architecture แบบ Single Page Application (SPA) โดยมีโครงสร้างดังนี้:

```
Red Envelope Game
├── Game Controller (จัดการ game state และ logic)
├── UI Manager (จัดการการแสดงผลและ user interaction)
├── Envelope Generator (สร้างและจัดการซองแดง)
├── Prize Calculator (คำนวณเงินรางวัลแบบสุ่ม)
├── Settings Manager (จัดการการตั้งค่าเกม)
├── Audio Manager (จัดการเสียง effects และการควบคุมเสียง)
├── Animation Manager (จัดการ visual animations และ effects)
└── Data Manager (จัดการการบันทึกและอ่านข้อมูลผู้เล่น)
```

## Components and Interfaces

### Game Controller
- **หน้าที่**: จัดการสถานะเกมหลัก และควบคุมการไหลของเกม
- **Methods**:
  - `initializeGame(settings)`: เริ่มต้นเกมใหม่ด้วยการตั้งค่าที่กำหนด
  - `openEnvelope(envelopeId)`: เปิดซองแดงและคำนวณรางวัล
  - `resetGame()`: รีเซ็ตเกมกลับสู่สถานะเริ่มต้น
  - `getGameState()`: ดึงสถานะปัจจุบันของเกม

### UI Manager
- **หน้าที่**: จัดการการแสดงผลและการโต้ตอบกับผู้ใช้
- **Methods**:
  - `renderSettingsScreen()`: แสดงหน้าจอการตั้งค่า
  - `renderGameScreen(envelopes)`: แสดงหน้าจอเกมพร้อมซองแดง
  - `updateEnvelopeDisplay(envelope)`: อัพเดทการแสดงผลซองแดงที่เปิดแล้ว
  - `showGameSummary(totalPrize)`: แสดงสรุปผลเกม

### Envelope Generator
- **หน้าที่**: สร้างและจัดการซองแดงพร้อมรูปม้าการ์ตูน
- **Methods**:
  - `generateEnvelopes(count)`: สร้างซองแดงตามจำนวนที่กำหนด
  - `assignHorseImages()`: กำหนดรูปม้าการ์ตูนที่แตกต่างกันให้แต่ละซอง
  - `getEnvelopeById(id)`: ดึงข้อมูลซองแดงตาม ID

### Prize Calculator
- **หน้าที่**: คำนวณเงินรางวัลแบบสุ่มภายในช่วงที่กำหนด
- **Methods**:
  - `calculateRandomPrize(minAmount, maxAmount)`: สุ่มเงินรางวัลในช่วงที่กำหนด
  - `validatePrizeRange(min, max)`: ตรวจสอบความถูกต้องของช่วงเงินรางวัล

### Settings Manager
- **หน้าที่**: จัดการและตรวจสอบการตั้งค่าเกม
- **Methods**:
  - `validateSettings(envelopeCount, minPrize, maxPrize)`: ตรวจสอบความถูกต้องของการตั้งค่า
  - `getDefaultSettings()`: ดึงการตั้งค่าเริ่มต้น

### Audio Manager
- **หน้าที่**: จัดการเสียง effects และการควบคุมเสียง
- **Methods**:
  - `playOpenEnvelopeSound()`: เล่นเสียงการเปิดซอง
  - `playSpecialPrizeSound(prizeAmount)`: เล่นเสียงพิเศษสำหรับรางวัลสูง
  - `playGameEndSound()`: เล่นเสียงจบเกม
  - `toggleSound(enabled)`: เปิด-ปิดเสียง
  - `preloadAudioFiles()`: โหลดไฟล์เสียงล่วงหน้า

### Animation Manager
- **หน้าที่**: จัดการ visual animations และ effects
- **Methods**:
  - `playOpenEnvelopeAnimation(envelope)`: เล่น animation การเปิดซอง
  - `playPrizeRevealAnimation(prizeAmount)`: เล่น animation การแสดงรางวัล
  - `playSpecialEffectAnimation(prizeAmount)`: เล่น animation พิเศษสำหรับรางวัลสูง
  - `playGameEndAnimation(totalPrize)`: เล่น animation จบเกม
  - `stopAllAnimations()`: หยุด animations ทั้งหมด

### Data Manager
- **หน้าที่**: จัดการการบันทึกและอ่านข้อมูลผู้เล่น
- **Methods**:
  - `validatePlayerName(name)`: ตรวจสอบความถูกต้องของชื่อผู้เล่น
  - `saveGameResult(playerName, totalPrize, gameDate)`: บันทึกผลการเล่นลงไฟล์
  - `downloadGameResults()`: ดาวน์โหลดไฟล์ผลการเล่น
  - `formatGameResult(playerName, totalPrize, gameDate)`: จัดรูปแบบข้อมูลสำหรับบันทึก
  - `generateFileName()`: สร้างชื่อไฟล์สำหรับบันทึกข้อมูล

## Data Models

### GameSettings
```javascript
{
  envelopeCount: number,    // จำนวนซองแดง (จำนวนเต็มบวก)
  minPrize: number,         // เงินรางวัลต่ำสุด (จำนวนเต็มบวก)
  maxPrize: number,         // เงินรางวัลสูงสุด (จำนวนเต็มบวก >= minPrize)
  soundEnabled: boolean,    // การเปิด-ปิดเสียง
  playerName: string        // ชื่อผู้เล่น (1-50 ตัวอักษร)
}
```

### Envelope
```javascript
{
  id: string,               // รหัสประจำซอง
  horseImageId: number,     // รหัสรูปม้าการ์ตูน
  isOpened: boolean,        // สถานะการเปิดซอง
  prizeAmount: number,      // จำนวนเงินรางวัล (เมื่อเปิดแล้ว)
  position: {x: number, y: number}  // ตำแหน่งการแสดงผล
}
```

### GameState
```javascript
{
  phase: string,            // 'settings' | 'playing' | 'finished'
  settings: GameSettings,   // การตั้งค่าปัจจุบัน
  envelopes: Envelope[],    // รายการซองแดงทั้งหมด
  totalPrize: number,       // เงินรางวัลรวม
  openedCount: number,      // จำนวนซองที่เปิดแล้ว
  isAnimating: boolean,     // สถานะการเล่น animation
  playerName: string        // ชื่อผู้เล่นปัจจุบัน
}
```

### GameResult
```javascript
{
  playerName: string,       // ชื่อผู้เล่น
  totalPrize: number,       // เงินรางวัลรวมที่ได้
  gameDate: Date,           // วันที่และเวลาที่เล่น
  envelopeCount: number,    // จำนวนซองที่เล่น
  minPrize: number,         // เงินรางวัลต่ำสุดที่ตั้งไว้
  maxPrize: number          // เงินรางวัลสูงสุดที่ตั้งไว้
}
```

### AudioAssets
```javascript
{
  openEnvelopeSound: string,    // ไฟล์เสียงการเปิดซอง
  specialPrizeSound: string,    // ไฟล์เสียงรางวัลพิเศษ
  gameEndSound: string,         // ไฟล์เสียงจบเกม
  backgroundMusic: string       // เพลงประกอบ (optional)
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Input validation consistency
*For any* input values for envelope count and prize range, the system should accept only positive integers for envelope count and valid prize ranges where minimum is less than or equal to maximum
**Validates: Requirements 1.2, 1.3**

### Property 2: Game session creation consistency
*For any* valid game settings, confirming the settings should create a Game_Session with exactly the same parameters as specified
**Validates: Requirements 1.4**

### Property 3: Invalid settings rejection
*For any* invalid game settings, the system should display an error message and prevent game initialization
**Validates: Requirements 1.5**

### Property 4: Envelope display count consistency
*For any* specified envelope count, the game should display exactly that number of envelopes on screen
**Validates: Requirements 2.1**

### Property 5: Horse cartoon uniqueness
*For any* set of envelopes in a game session, each envelope should display a different horse cartoon image
**Validates: Requirements 2.2**

### Property 6: Envelope state display consistency
*For any* envelope, its visual state should correctly reflect whether it is opened or closed, showing horse cartoon when closed and prize amount when opened
**Validates: Requirements 2.3, 2.4**

### Property 7: Envelope opening behavior
*For any* unopened envelope, clicking it should open the envelope, display a random prize amount, and change its state to opened
**Validates: Requirements 3.1, 3.4**

### Property 8: Prize amount range validation
*For any* prize calculation, the generated amount should be a positive integer within the specified minimum and maximum range
**Validates: Requirements 3.2**

### Property 9: Opened envelope immutability
*For any* already opened envelope, clicking it should not change its state, prize amount, or any other properties
**Validates: Requirements 3.3**

### Property 10: Total prize calculation accuracy
*For any* sequence of envelope openings, the displayed total prize should equal the sum of all individual prize amounts from opened envelopes
**Validates: Requirements 4.1**

### Property 11: Game reset consistency
*For any* game state, initiating a new game should reset all game state variables and return to the settings screen
**Validates: Requirements 4.4**

### Property 12: Sound effect triggering
*For any* envelope opening action, the system should play the appropriate sound effect based on the prize amount and current audio settings
**Validates: Requirements 4.1, 4.3**

### Property 13: Animation synchronization
*For any* envelope opening, the visual animation should complete before allowing the next interaction
**Validates: Requirements 4.2**

### Property 14: Audio control functionality
*For any* audio control toggle, the system should correctly enable or disable all sound effects according to the setting
**Validates: Requirements 4.5**

### Property 15: Statistics display accuracy
*For any* game state, the displayed statistics should correctly show the count of opened envelopes and remaining unopened envelopes
**Validates: Requirements 5.5**

### Property 16: Player name validation
*For any* player name input, the system should accept only valid names with length between 1-50 characters and reject empty or invalid names
**Validates: Requirements 6.2, 6.3**

### Property 17: Game result data integrity
*For any* completed game, the saved game result should contain accurate player name, total prize, and timestamp information
**Validates: Requirements 6.4, 6.5**

## Error Handling

### Input Validation Errors
- **Invalid envelope count**: แสดงข้อความ "กรุณากรอกจำนวนซองเป็นจำนวนเต็มบวก"
- **Invalid prize range**: แสดงข้อความ "กรุณากรอกช่วงเงินรางวัลที่ถูกต้อง (ค่าต่ำสุด ≤ ค่าสูงสุด)"
- **Empty fields**: แสดงข้อความ "กรุณากรอกข้อมูลให้ครบถ้วน"

### Runtime Errors
- **Image loading failure**: ใช้รูปภาพ placeholder สำหรับม้าการ์ตูน
- **Audio loading failure**: เล่นเกมต่อไปโดยไม่มีเสียง และแสดงข้อความแจ้งเตือน
- **Animation failure**: ข้ามการเล่น animation และแสดงผลโดยตรง
- **Random number generation failure**: ใช้ค่าเริ่มต้นเป็นค่ากลางของช่วงที่กำหนด
- **DOM manipulation errors**: แสดงข้อความแจ้งเตือนและรีเฟรชหน้าเว็บ

### User Experience Errors
- **Double-click prevention**: ป้องกันการคลิกซ้ำในช่วงเวลาสั้นๆ และระหว่างการเล่น animation
- **Invalid interaction**: เพิกเฉยต่อการคลิกที่ไม่เกี่ยวข้อง
- **Audio permission denied**: แสดงข้อความแจ้งให้ผู้ใช้อนุญาตการเล่นเสียง
- **Browser compatibility**: แสดงข้อความแจ้งเตือนหากเบราว์เซอร์ไม่รองรับ Web Audio API

## Testing Strategy

### Unit Testing Approach
ระบบจะใช้ **Jest** เป็น testing framework สำหรับ unit tests โดยจะทดสอบ:

- **Component functionality**: ทดสอบฟังก์ชันแต่ละตัวทำงานถูกต้อง
- **Edge cases**: ทดสอบกรณีขอบเขต เช่น จำนวนซอง 1 ใบ, ช่วงเงินรางวัลเท่ากัน
- **Error conditions**: ทดสอบการจัดการข้อผิดพลาด
- **Integration points**: ทดสอบการทำงานร่วมกันระหว่าง components

### Property-Based Testing Approach
ระบบจะใช้ **fast-check** เป็น property-based testing library สำหรับ JavaScript โดย:

- **กำหนดให้แต่ละ property-based test รันอย่างน้อย 20 iterations**
- **แต่ละ property-based test จะมี comment ที่อ้างอิงถึง correctness property ในเอกสารนี้**
- **ใช้รูปแบบ comment: `// **Feature: red-envelope-game, Property {number}: {property_text}**`**
- **แต่ละ correctness property จะถูกทดสอบด้วย property-based test เพียงตัวเดียว**

Property-based tests จะครอบคลุม:
- **Input validation**: ทดสอบการตรวจสอบ input ทุกรูปแบบ
- **Game state consistency**: ทดสอบความสอดคล้องของสถานะเกม
- **Prize calculation**: ทดสอบการคำนวณรางวัลในทุกสถานการณ์
- **UI state management**: ทดสอบการจัดการสถานะ UI
- **Audio/Visual effects**: ทดสอบการทำงานของ sound effects และ animations
- **Audio control**: ทดสอบการควบคุมเสียงในทุกสถานการณ์

### Complementary Testing Strategy
Unit tests และ property tests จะทำงานร่วมกัน:
- **Unit tests** จะจับข้อผิดพลาดเฉพาะเจาะจง และทดสอบ integration points
- **Property tests** จะตรวจสอบความถูกต้องทั่วไปในทุกสถานการณ์
- **ร่วมกันให้ความครอบคลุมที่สมบูรณ์**: unit tests จับ bugs เฉพาะ, property tests ตรวจสอบความถูกต้องโดยรวม