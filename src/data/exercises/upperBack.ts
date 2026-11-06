import { Program } from '../../types';

export const upperBackProgram: Program = {
  id: 'upper-back-program',
  bodyPart: 'Upper Back',
  bodyPartId: 'upper-back',
  title: 'Upper Back & Thoracic Spine Mobility',
  description: 'A 4-week program to relieve upper back tension, improve thoracic mobility, and strengthen postural muscles.',
  duration: 4,
  weeks: [
    {
      week: 1,
      focus: 'Pain Relief & Gentle Mobility',
      exercises: [
        {
          id: 'ub-w1-e1',
          name: 'Thoracic Extension on Foam Roller',
          description: 'Gentle extension to mobilize the thoracic spine.',
          instructions: [
            'Place foam roller horizontally under upper back',
            'Support head with hands behind neck',
            'Keep hips on the floor',
            'Gently extend back over the roller',
            'Hold 5 seconds, move roller up slightly, repeat'
          ],
          sets: 2,
          reps: 10,
          videoUrl: '',
          difficulty: 'beginner',
          targetArea: 'Thoracic spine'
        },
        {
          id: 'ub-w1-e2',
          name: 'Chin Tucks',
          description: 'Correct forward head posture and relieve upper back tension.',
          instructions: [
            'Sit or stand with good posture',
            'Draw chin straight back (make a double chin)',
            'Keep eyes level, don\'t look down',
            'Hold for 5 seconds',
            'Relax and repeat'
          ],
          sets: 3,
          reps: 10,
          videoUrl: 'https://www.youtube.com/embed/wQylqaCl8Zo',
          difficulty: 'beginner',
          targetArea: 'Deep neck flexors, upper thoracic'
        },
        {
          id: 'ub-w1-e3',
          name: 'Cat-Cow Stretch',
          description: 'Spinal mobility focusing on upper back.',
          instructions: [
            'Start on hands and knees',
            'Round upper back toward ceiling (cat)',
            'Focus on spreading shoulder blades apart',
            'Then arch back and squeeze shoulder blades (cow)',
            'Move slowly between positions'
          ],
          sets: 2,
          reps: 10,
          videoUrl: 'https://www.youtube.com/embed/dfMiuFsM1o8',
          difficulty: 'beginner',
          targetArea: 'Full spine, emphasis on thoracic'
        },
        {
          id: 'ub-w1-e4',
          name: 'Thread the Needle',
          description: 'Thoracic rotation stretch.',
          instructions: [
            'Start on hands and knees',
            'Reach one arm under body toward opposite side',
            'Let shoulder and head rest on floor',
            'Hold for 30 seconds',
            'Return and repeat on other side'
          ],
          sets: 2,
          duration: '30 seconds each side',
          videoUrl: '',
          difficulty: 'beginner',
          targetArea: 'Thoracic rotators, rhomboids'
        },
        {
          id: 'ub-w1-e5',
          name: 'Doorway Chest Stretch',
          description: 'Open up the chest to relieve upper back tension.',
          instructions: [
            'Stand in a doorway with arms on frame',
            'Elbows at 90 degrees, at shoulder height',
            'Step one foot forward through doorway',
            'Lean forward until you feel chest stretch',
            'Hold for 30 seconds'
          ],
          sets: 2,
          duration: '30 seconds',
          videoUrl: '',
          difficulty: 'beginner',
          targetArea: 'Pectorals, anterior shoulders'
        }
      ]
    },
    {
      week: 2,
      focus: 'Postural Awareness & Activation',
      exercises: [
        {
          id: 'ub-w2-e1',
          name: 'Scapular Squeezes',
          description: 'Activate rhomboids and middle trapezius.',
          instructions: [
            'Sit or stand with arms at sides',
            'Squeeze shoulder blades together',
            'Imagine holding a pencil between them',
            'Hold for 5 seconds',
            'Relax and repeat'
          ],
          sets: 3,
          reps: 15,
          videoUrl: 'https://www.youtube.com/embed/wQylqaCl8Zo',
          difficulty: 'beginner',
          targetArea: 'Rhomboids, middle trapezius'
        },
        {
          id: 'ub-w2-e2',
          name: 'Wall Angels',
          description: 'Improve shoulder mobility and posture.',
          instructions: [
            'Stand with back flat against wall',
            'Arms in goalpost position against wall',
            'Slowly slide arms up overhead',
            'Keep arms and back touching wall',
            'Lower back down and repeat'
          ],
          sets: 3,
          reps: 10,
          videoUrl: 'https://www.youtube.com/embed/wQylqaCl8Zo',
          difficulty: 'beginner',
          targetArea: 'Trapezius, serratus anterior, rotator cuff'
        },
        {
          id: 'ub-w2-e3',
          name: 'Prone Y Raises',
          description: 'Strengthen lower trapezius.',
          instructions: [
            'Lie face down on floor or bench',
            'Arms extended overhead in Y position',
            'Thumbs pointing up',
            'Lift arms off floor, squeezing shoulder blades',
            'Hold 3 seconds, lower slowly'
          ],
          sets: 3,
          reps: 10,
          videoUrl: 'https://www.youtube.com/embed/wQylqaCl8Zo',
          difficulty: 'beginner',
          targetArea: 'Lower trapezius'
        },
        {
          id: 'ub-w2-e4',
          name: 'Prone T Raises',
          description: 'Strengthen middle trapezius and rhomboids.',
          instructions: [
            'Lie face down on floor or bench',
            'Arms extended out to sides in T position',
            'Thumbs pointing up',
            'Lift arms off floor, squeezing shoulder blades',
            'Hold 3 seconds, lower slowly'
          ],
          sets: 3,
          reps: 10,
          videoUrl: 'https://www.youtube.com/embed/wQylqaCl8Zo',
          difficulty: 'beginner',
          targetArea: 'Middle trapezius, rhomboids'
        },
        {
          id: 'ub-w2-e5',
          name: 'Upper Trapezius Stretch',
          description: 'Release tension in upper trapezius.',
          instructions: [
            'Sit tall, hold bottom of chair with right hand',
            'Tilt head to left, bringing left ear toward left shoulder',
            'Gently add pressure with left hand on head',
            'Hold for 30 seconds',
            'Repeat on other side'
          ],
          sets: 2,
          duration: '30 seconds each side',
          videoUrl: 'https://www.youtube.com/embed/wQylqaCl8Zo',
          difficulty: 'beginner',
          targetArea: 'Upper trapezius, levator scapulae'
        }
      ]
    },
    {
      week: 3,
      focus: 'Strength Building',
      exercises: [
        {
          id: 'ub-w3-e1',
          name: 'Resistance Band Rows',
          description: 'Strengthen rhomboids and lats.',
          instructions: [
            'Secure band at chest height or around feet',
            'Hold band with arms extended',
            'Pull elbows back, squeezing shoulder blades',
            'Keep elbows close to body',
            'Control the return'
          ],
          sets: 3,
          reps: 12,
          videoUrl: '',
          difficulty: 'intermediate',
          targetArea: 'Rhomboids, lats, middle trapezius'
        },
        {
          id: 'ub-w3-e2',
          name: 'Resistance Band Pull-Aparts',
          description: 'Strengthen posterior deltoids and rhomboids.',
          instructions: [
            'Hold band with arms straight in front',
            'Keep arms at shoulder height',
            'Pull band apart by moving arms outward',
            'Squeeze shoulder blades at end',
            'Control return to start'
          ],
          sets: 3,
          reps: 15,
          videoUrl: '',
          difficulty: 'intermediate',
          targetArea: 'Posterior deltoids, rhomboids'
        },
        {
          id: 'ub-w3-e3',
          name: 'Prone W Raises',
          description: 'Strengthen rotator cuff and lower trapezius.',
          instructions: [
            'Lie face down on floor',
            'Bend elbows 90 degrees, arms form W shape',
            'Lift arms while squeezing shoulder blades',
            'Rotate thumbs toward ceiling',
            'Hold 3 seconds, lower slowly'
          ],
          sets: 3,
          reps: 10,
          videoUrl: 'https://www.youtube.com/embed/wQylqaCl8Zo',
          difficulty: 'intermediate',
          targetArea: 'Lower trapezius, rotator cuff'
        },
        {
          id: 'ub-w3-e4',
          name: 'Quadruped Thoracic Rotation',
          description: 'Improve thoracic spine rotation mobility.',
          instructions: [
            'Start on hands and knees',
            'Place one hand behind head',
            'Rotate that elbow down toward opposite arm',
            'Then rotate up toward ceiling, opening chest',
            'Follow elbow with eyes throughout'
          ],
          sets: 3,
          reps: 10,
          videoUrl: '',
          difficulty: 'intermediate',
          targetArea: 'Thoracic rotators'
        },
        {
          id: 'ub-w3-e5',
          name: 'Face Pulls with Band',
          description: 'Strengthen external rotators and upper back.',
          instructions: [
            'Attach band at face height',
            'Hold band with both hands, arms extended',
            'Pull band toward face, elbows high',
            'Externally rotate shoulders at end',
            'Squeeze shoulder blades, return slowly'
          ],
          sets: 3,
          reps: 12,
          videoUrl: '',
          difficulty: 'intermediate',
          targetArea: 'Rear deltoids, external rotators, rhomboids'
        }
      ]
    },
    {
      week: 4,
      focus: 'Functional Movement & Maintenance',
      exercises: [
        {
          id: 'ub-w4-e1',
          name: 'IYT Raises',
          description: 'Complete upper back strengthening sequence.',
          instructions: [
            'Lie face down or stand hinged forward',
            'Perform 8 I raises (arms straight overhead)',
            'Perform 8 Y raises (arms in Y position)',
            'Perform 8 T raises (arms out to sides)',
            'Keep thumbs up throughout'
          ],
          sets: 2,
          reps: 8,
          videoUrl: 'https://www.youtube.com/embed/wQylqaCl8Zo',
          difficulty: 'intermediate',
          targetArea: 'Full trapezius, rhomboids'
        },
        {
          id: 'ub-w4-e2',
          name: 'Band Rows with Rotation',
          description: 'Functional pulling pattern with rotation.',
          instructions: [
            'Hold band with one hand, arm extended',
            'Pull elbow back while rotating torso',
            'Squeeze shoulder blade at end range',
            'Control the return with rotation',
            'Complete all reps, then switch sides'
          ],
          sets: 3,
          reps: 10,
          videoUrl: '',
          difficulty: 'intermediate',
          targetArea: 'Rhomboids, lats, thoracic rotators'
        },
        {
          id: 'ub-w4-e3',
          name: 'Wall Slides',
          description: 'Improve scapular control and overhead mobility.',
          instructions: [
            'Stand with back against wall',
            'Forearms against wall, elbows at 90 degrees',
            'Slide forearms up the wall overhead',
            'Keep contact with wall throughout',
            'Slide back down with control'
          ],
          sets: 3,
          reps: 10,
          videoUrl: 'https://www.youtube.com/embed/wQylqaCl8Zo',
          difficulty: 'intermediate',
          targetArea: 'Serratus anterior, lower trapezius'
        },
        {
          id: 'ub-w4-e4',
          name: 'Seated Thoracic Extension',
          description: 'Mobilize thoracic spine in sitting.',
          instructions: [
            'Sit on chair, hands behind head',
            'Elbows pointing forward',
            'Extend upper back over chair back',
            'Open elbows wide as you extend',
            'Hold 5 seconds, return to start'
          ],
          sets: 2,
          reps: 10,
          videoUrl: '',
          difficulty: 'beginner',
          targetArea: 'Thoracic spine extensors'
        },
        {
          id: 'ub-w4-e5',
          name: 'Upper Back Mobility Flow',
          description: 'Complete mobility sequence for maintenance.',
          instructions: [
            'Perform 10 cat-cow cycles with focus on upper back',
            'Hold thread the needle 30 seconds each side',
            'Perform 10 thoracic rotations each side',
            'Finish with doorway stretch 30 seconds',
            'Move smoothly between positions'
          ],
          sets: 1,
          duration: '5 minutes',
          videoUrl: '',
          difficulty: 'intermediate',
          targetArea: 'Full thoracic spine and shoulders'
        }
      ]
    }
  ]
};
