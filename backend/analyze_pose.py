import sys
import json
import cv2
import mediapipe as mp
import math

# Get CLI arguments
video_path = sys.argv[1]
mode = sys.argv[2] if len(sys.argv) > 2 else "desk"

# Setup MediaPipe
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=False)
mp_drawing = mp.solutions.drawing_utils

violations = []
cap = cv2.VideoCapture(video_path)
frame_idx = 0

while cap.isOpened():
    success, frame = cap.read()
    if not success:
        break

    frame_idx += 1
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = pose.process(frame_rgb)

    if not results.pose_landmarks:
        continue

    lm = results.pose_landmarks.landmark

    def get_angle(a, b, c):
        ax, ay = lm[a].x, lm[a].y
        bx, by = lm[b].x, lm[b].y
        cx, cy = lm[c].x, lm[c].y
        ab = ((ax - bx) ** 2 + (ay - by) ** 2) ** 0.5
        bc = ((bx - cx) ** 2 + (by - cy) ** 2) ** 0.5
        ac = ((ax - cx) ** 2 + (ay - cy) ** 2) ** 0.5
        try:
            angle = math.acos((ab**2 + bc**2 - ac**2) / (2 * ab * bc)) * (180 / math.pi)
        except:
            angle = 0
        return angle

    # ---------- Mode: Desk Sitting ----------
    if mode == "desk":
        # Back angle (should be ≥150°)
        back_angle = get_angle(mp_pose.PoseLandmark.LEFT_HIP.value,
                               mp_pose.PoseLandmark.LEFT_SHOULDER.value,
                               mp_pose.PoseLandmark.LEFT_EAR.value)
        if back_angle < 150:
            violations.append({
                "frame": frame_idx,
                "issue": "Back angle too low (<150°)",
                "value": round(back_angle, 2)
            })

        # Neck bending (>30°)
        neck_angle = get_angle(mp_pose.PoseLandmark.NOSE.value,
                               mp_pose.PoseLandmark.LEFT_SHOULDER.value,
                               mp_pose.PoseLandmark.LEFT_HIP.value)
        if neck_angle > 30:
            violations.append({
                "frame": frame_idx,
                "issue": "Neck bending > 30°",
                "value": round(neck_angle, 2)
            })

    # ---------- Mode: Squat ----------
    elif mode == "squat":
        # Back angle (should be ≥150°)
        back_angle = get_angle(mp_pose.PoseLandmark.LEFT_HIP.value,
                               mp_pose.PoseLandmark.LEFT_SHOULDER.value,
                               mp_pose.PoseLandmark.LEFT_EAR.value)
        if back_angle < 150:
            violations.append({
                "frame": frame_idx,
                "issue": "Back angle too low during squat (<150°)",
                "value": round(back_angle, 2)
            })

        # Knee goes beyond toe
        knee_x = lm[mp_pose.PoseLandmark.LEFT_KNEE.value].x
        toe_x = lm[mp_pose.PoseLandmark.LEFT_FOOT_INDEX.value].x
        hip_x = lm[mp_pose.PoseLandmark.LEFT_HIP.value].x

        if abs(knee_x - hip_x) > abs(toe_x - hip_x):  # Knee ahead of toe
            violations.append({
                "frame": frame_idx,
                "issue": "Knee goes beyond toe",
                "value": round(abs(knee_x - toe_x), 2)
            })

cap.release()
pose.close()

# Output violations
print(json.dumps({
    "total_frames": frame_idx,
    "violations": violations
}))

