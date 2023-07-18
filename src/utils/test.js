let eye_cnt = undefined; let status = 'no camera'; let prev_pid = '1'

eye_cnt = 0 ; status = 'detected'; prev_pid = '1'

eye_cnt = 0 ; status = 'detected'; prev_pid = '1'; pid = '2'

eye_cnt = 8 ; stauts = 'not detected'; prev_pid = '2'

eye_cnt = 8 ; stauts = 'not detected'; prev_pid = '2'; pid = '3'

eye_cnt = 9 ; status = 'detected'; prev_pid = '3'

eye_cnt = 12 ; status = 'detected'; prev_pid = '3'; pid = '4'


// pid가 바뀌고 쿼리가 나가야 되는 시점 //

/*
detected 상태이고 pid가 바뀜 -> prev_pid = pid
*/

// 쿼리만 나가는 시점 //
/*
detected 상태에서 not detected로 상태가 바뀜 prev_pid = prev_pid
*/


// pid만 바뀌여야 하는 시점 (쿼리 X)//
/**
no camera 상태에서 (not detected 혹은 detected로) 바뀔때 prev_pid = pid
not detected 상태에서 pid가 바뀜 -> prev_pid = pid

 */

// prev_time 업데이트 해야하는 시점 //
/*
detected 상태이고 pid가 바뀜 -> prev_pid = pid
detected 상태에서 not detected로 상태가 바뀜 prev_pid = prev_pid
no camera 상태에서 (not detected 혹은 detected로) 바뀔때 prev_pid = pid
not detected 상태에서 detected 상태로 변경

*/

