// import { httpService } from './http.service'
import { storageService } from './async-storage.service'
import { userService } from './user.service'
import { socketService, SOCKET_EVENT_REVIEW_ADDED, SOCKET_EVENT_REVIEW_ABOUT_YOU } from './socket.service'
import { getActionRemoveReview, getActionAddReview } from '../store/review.actions'
import { showSuccessMsg } from '../services/event-bus.service'

export const reviewService = {
  add,
  query,
  remove
}


function query(filterBy) {
  var queryStr = (!filterBy) ? '' : `?name=${filterBy.name}&sort=anaAref`
  // return httpService.get(`review${queryStr}`)
  return storageService.query('review')
}

async function remove(reviewId) {
  // await httpService.delete(`review/${reviewId}`)
  await storageService.remove('review', reviewId)



}
async function add(review) {
  // const addedReview = await httpService.post(`review`, review)

  review.byUser = userService.getLoggedinUser()
  review.aboutUser = await userService.getById(review.aboutUserId)
  const addedReview = await storageService.post('review', review)



  return addedReview
}

// This way, we can also subscribe to none-store data change
// function subscribe(listener) {
//   reviewChannel.addEventListener('message', listener)
// }
// function unsubscribe(listener) {
//   reviewChannel.removeEventListener('message', listener)
// }
