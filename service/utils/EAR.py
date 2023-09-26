import math
import numpy as np
import cv2 as cv
from utils import draw as utils

# Euclaidean distance 
def euclaideanDistance(point, point1):
    x, y = point
    x1, y1 = point1
    distance = math.sqrt((x1 - x)**2 + (y1 - y)**2)
    return distance

# Blinking Ratio
def blinkRatio_4(img, landmarks, right_indices, left_indices):
    # Right eyes 
    # horizontal line 
    rh_right = landmarks[right_indices[0]] # 33
    rh_left = landmarks[right_indices[8]] # 133
    # vertical line 
    rv_top = landmarks[right_indices[12]] # 159
    rv_bottom = landmarks[right_indices[4]] # 145
    # draw lines on right eyes 
    # cv.line(img, rh_right, rh_left, utils.GREEN, 2)
    # cv.line(img, rv_top, rv_bottom, utils.WHITE, 2)

    # LEFT_EYE 
    # horizontal line 
    lh_right = landmarks[left_indices[0]] # 362
    lh_left = landmarks[left_indices[8]] # 263

    # vertical line 
    lv_top = landmarks[left_indices[12]] # 386
    lv_bottom = landmarks[left_indices[4]] # 374

    rhDistance = euclaideanDistance(rh_right, rh_left)
    rvDistance = euclaideanDistance(rv_top, rv_bottom)

    lvDistance = euclaideanDistance(lv_top, lv_bottom)
    lhDistance = euclaideanDistance(lh_right, lh_left)
    if (rhDistance < 0.03) or (lhDistance < 0.03):
        print('hi')
    if rhDistance == 0:
        rhDistance = 0.001
    if lhDistance == 0:
        lhDistance = 0.001
    reRatio = rvDistance/rhDistance
    leRatio = lvDistance/lhDistance
    ratio = (reRatio+leRatio)/2
    return ratio,reRatio,leRatio 



# Blinking Ratio (6개사용 landmark )
def blinkRatio(img, landmarks, right_indices, left_indices):
    
    
    # Left eyes indices 
    #LEFT_EYE =[ 362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385,384, 398 ]
    #LEFT_EYEBROW =[ 336, 296, 334, 293, 300, 276, 283, 282, 295, 285 ]

    # right eyes indices
    #RIGHT_EYE=[ 33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161 , 246 ]  
    #RIGHT_EYEBROW=[ 70, 63, 105, 66, 107, 55, 65, 52, 53, 46 ]
    
    # Right eyes 
    # horizontal line 
    rh_right = landmarks[right_indices[0]] # 33
    rh_left = landmarks[right_indices[8]] # 133
    # vertical line 
    rv_top_left = landmarks[right_indices[13]] # 160
    rv_top_right = landmarks[right_indices[11]] # 158
    
    rv_bottom_left = landmarks[right_indices[3]] # 144
    rv_bottom_right = landmarks[right_indices[5]] # 153
    
    # draw lines on right eyes 
    # cv.line(img, rh_right, rh_left, utils.GREEN, 2)
    # cv.line(img, rv_top, rv_bottom, utils.WHITE, 2)

    # LEFT_EYE 
    # horizontal line 
    lh_right = landmarks[left_indices[0]] # 362
    lh_left = landmarks[left_indices[8]] # 263

    # vertical line 
    lv_top_left = landmarks[left_indices[13]] # 385
    lv_top_right = landmarks[left_indices[11]] # 387
    lv_bottom_left = landmarks[left_indices[3]] # 380
    lv_bottom_right = landmarks[left_indices[5]] # 373
    

    rhDistance = euclaideanDistance(rh_right, rh_left)
    rvDistance_left = euclaideanDistance(rv_top_left, rv_bottom_left)
    rvDistance_right = euclaideanDistance(rv_top_right, rv_bottom_right)

    lhDistance = euclaideanDistance(lh_right, lh_left)
    lvDistance_left = euclaideanDistance(lv_top_left, lv_bottom_left)
    lvDistance_right = euclaideanDistance(lv_top_right, lv_bottom_right)
    
    # 0.06 이하 정도가 눈 완전히 감음 (TODO 이거는 본인 기준)
    # 0.08x 이상이 눈뜨는 시점으로 봄
    reRatio = (rvDistance_left+rvDistance_right)/(2* rhDistance)
    leRatio = (lvDistance_left+lvDistance_right)/(2* lhDistance)
    ratio = (reRatio+leRatio)/2

    if ratio < 0.09:
        print('h')
    return ratio,reRatio,leRatio 



# Eyes Extrctor function,
def eyesExtractor(img, right_eye_coords, left_eye_coords):
    # converting color image to  scale image 
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    
    # getting the dimension of image 
    dim = gray.shape

    # creating mask from gray scale dim
    mask = np.zeros(dim, dtype=np.uint8)

    # drawing Eyes Shape on mask with white color 
    cv.fillPoly(mask, [np.array(right_eye_coords, dtype=np.int32)], 255)
    cv.fillPoly(mask, [np.array(left_eye_coords, dtype=np.int32)], 255)

    # showing the mask 
    # cv.imshow('mask', mask)
    
    # draw eyes image on mask, where white shape is 
    eyes = cv.bitwise_and(gray, gray, mask=mask)
    # change black color to gray other than eys 
    # cv.imshow('eyes draw', eyes)
    eyes[mask==0]=155
    
    # getting minium and maximum x and y  for right and left eyes 
    # For Right Eye 
    r_max_x = (max(right_eye_coords, key=lambda item: item[0]))[0]
    r_min_x = (min(right_eye_coords, key=lambda item: item[0]))[0]
    r_max_y = (max(right_eye_coords, key=lambda item : item[1]))[1]
    r_min_y = (min(right_eye_coords, key=lambda item: item[1]))[1]

    # For LEFT Eye
    l_max_x = (max(left_eye_coords, key=lambda item: item[0]))[0]
    l_min_x = (min(left_eye_coords, key=lambda item: item[0]))[0]
    l_max_y = (max(left_eye_coords, key=lambda item : item[1]))[1]
    l_min_y = (min(left_eye_coords, key=lambda item: item[1]))[1]

    # croping the eyes from mask 
    cropped_right = eyes[r_min_y: r_max_y, r_min_x: r_max_x]
    cropped_left = eyes[l_min_y: l_max_y, l_min_x: l_max_x]

    # returning the cropped eyes 
    return cropped_right, cropped_left

# Eyes Postion Estimator 
def positionEstimator(cropped_eye):
    # getting height and width of eye 
    h, w =cropped_eye.shape
    
    # remove the noise from images
    gaussain_blur = cv.GaussianBlur(cropped_eye, (9,9),0)
    median_blur = cv.medianBlur(gaussain_blur, 3)

    # applying thrsholding to convert binary_image
    ret, threshed_eye = cv.threshold(median_blur, 130, 255, cv.THRESH_BINARY)

    # create fixd part for eye with 
    piece = int(w/3) 

    # slicing the eyes into three parts 
    right_piece = threshed_eye[0:h, 0:piece]
    center_piece = threshed_eye[0:h, piece: piece+piece]
    left_piece = threshed_eye[0:h, piece +piece:w]
    
    # calling pixel counter function
    eye_position, color = pixelCounter(right_piece, center_piece, left_piece)

    return eye_position, color 

# creating pixel counter function 
def pixelCounter(first_piece, second_piece, third_piece):
    # counting black pixel in each part 
    right_part = np.sum(first_piece==0)
    center_part = np.sum(second_piece==0)
    left_part = np.sum(third_piece==0)
    # creating list of these values
    eye_parts = [right_part, center_part, left_part]

    # getting the index of max values in the list 
    max_index = eye_parts.index(max(eye_parts))
    pos_eye ='' 
    if max_index==0:
        pos_eye="RIGHT"
        color=[utils.BLACK, utils.GREEN]
    elif max_index==1:
        pos_eye = 'CENTER'
        color = [utils.YELLOW, utils.PINK]
    elif max_index ==2:
        pos_eye = 'LEFT'
        color = [utils.GRAY, utils.YELLOW]
    else:
        pos_eye="Closed"
        color = [utils.GRAY, utils.YELLOW]
    return pos_eye, color
