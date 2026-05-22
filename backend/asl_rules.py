def classify_asl(landmarks: list) -> tuple[str, float]:
    """
    Simple rule-based classification for ASL alphabet.
    Expected landmarks is a list of 21 dictionaries with x, y, z coordinates.
    MediaPipe landmarks:
    0: wrist
    4: thumb tip, 3: thumb ip, 2: thumb mcp
    8: index tip, 6: index pip, 5: index mcp
    12: middle tip, 10: middle pip, 9: middle mcp
    16: ring tip, 14: ring pip, 13: ring mcp
    20: pinky tip, 18: pinky pip, 17: pinky mcp
    """
    if len(landmarks) != 21:
        return ("Unknown", 0.0)

    # Helper function to check if a finger is extended
    # A finger is extended if its tip is higher (y is smaller) than its pip
    def is_extended(tip_idx, pip_idx):
        return landmarks[tip_idx].y < landmarks[pip_idx].y

    thumb_extended = landmarks[4].x > landmarks[3].x if landmarks[5].x > landmarks[17].x else landmarks[4].x < landmarks[3].x # naive check for right/left hand thumb
    index_extended = is_extended(8, 6)
    middle_extended = is_extended(12, 10)
    ring_extended = is_extended(16, 14)
    pinky_extended = is_extended(20, 18)

    # Letter A: All fingers closed, thumb extended
    if not index_extended and not middle_extended and not ring_extended and not pinky_extended:
        # Check if thumb is next to index finger
        return ("A", 0.8)

    # Letter B: All fingers extended, thumb folded
    if index_extended and middle_extended and ring_extended and pinky_extended and not thumb_extended:
        return ("B", 0.8)

    # Letter V: Index and middle extended
    if index_extended and middle_extended and not ring_extended and not pinky_extended:
        return ("V", 0.8)

    # Letter W: Index, middle, ring extended
    if index_extended and middle_extended and ring_extended and not pinky_extended:
        return ("W", 0.8)

    # Letter L: Index and thumb extended
    if index_extended and not middle_extended and not ring_extended and not pinky_extended and thumb_extended:
        return ("L", 0.8)
        
    # Letter C: Curved hand (naive implementation: tips are lower than pip, but higher than wrist)
    if not index_extended and not middle_extended and landmarks[8].y > landmarks[6].y and landmarks[8].y < landmarks[0].y:
        return ("C", 0.6)

    return ("Unknown", 0.0)
