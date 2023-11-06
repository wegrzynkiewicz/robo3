# Aplikacje

- HomePage
- GameApp
- GameAppDebugPanel
- AdminPanel
- MasterServer
- GameServer
- GameServerModSandbox
- WorldGenerator

## GameObjects

### Properties

<!-- - Ground - może zostać wykorzystany jako obiekt podłoża naturalnego -->
- Walk - ten obiekt wpływa na prędkość poruszania się
  - SpeedValue - wartość prędkości poruszania się po obiekcie
- Extract - obiekt, który za pomocą narzędzi może zostać wydobyty i stać się przedmiotem
- Terrain - obiekt posiada zdolność do wypełniania siatki podczas budowania sceny
- Item - przedmiot można podnieść i przenosić między magazynami
  - Weight
  - Stack - maksymalna liczba przedmiotów w jednej grupie
  - Slots - definicja slotów, gdzie można dany obiekt włożyć, dla człowieka np (głowa, ręce)
- Consumable
- Edible
- Being
- Tool
  - SpeedValue - prędkość użycia narzędzia
  - Durability - narzędzie może tylko zostać użyte określoną ilość razy
- Weapon
- Collision - kolizje danego obiektu
  - Solid - całkowicie stały obiekt
  - Bounding - zawiera prostokąty które opisują kolizje
  - None - brak kolizji
- Transform - obiekt psuje się w czasie
  - "Item" - czym obiekt stanie się po zepsuciu
  - Duration - ile trwa pełny proces zepsucia
- View - wizualna reprezentacja obiektu
- Size - rozmiar obiektu

- Processor - obiekt posiada processor, który steruje zachowaniem tego obiektu

### Behavior

- posiada stan
- posiada własne, niewspółdzielone właściwości

- simplex - obiekt, nie ma stanu, współdzieli właściwości, jest zapisany jako element w siatce lub liście
- eX - obiekt posiada stan, współdzieli właściwości 
- complex - obiekt posiada stan, jest przetwarzany 
- being - obiekt posiada stan, nie jest doklejany do chunka, ani magazynu

### Example game objects

- core/grass-ground - Walkable, Terrain, Extractable
- core/mown-grass-item - Item, Consumable, Transform

# ShortCuts

ga - Game Action
ka - Keyboard Action
go - Game Object
ua - User Action

# TODO

- [ ] Zaprojektowanie modelu przedmiotów w grze
- [ ] Upakowanie danych o teksturze kafelka w teksturze "danych"
- [ ] Dekonstrukcja mapy z GRIDa na kafelki o zaokrąglonych kształtach
- [ ] Informacje w DebugInfo o wyświetlanych chunkach i ilościach kafelków
