import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { gigService } from "../services/gig.service"
import { GigPlans } from "../cmps/gig-plans"
import { SellerInfo } from "../cmps/seller-info"
import { ReviewList } from "../cmps/review-list"
import { GigImgsCarousel } from "../cmps/gig-imgs-carousel"
import { SellerOverview } from "../cmps/seller-overview"
import { CssVarsProvider } from '@mui/joy/styles'
import ReactStars from 'react-stars'
import { utilService } from "../services/util.service"
import { ReviewsFilter } from "../cmps/reviews-filter"
import { AddReview } from "../cmps/add-review"
import { orderService } from "../services/order.service"
import { showErrorMsg, showSuccessMsg } from "../services/event-bus.service"
import { useSelector } from "react-redux"
import { PurchaseModal } from "../cmps/purchase-modal"




export const GigDetails = () => {

    const [screenWidth, setScreenWidth] = useState()
    const [gig, setGig] = useState()
    const [reviews, setReviews] = useState([])
    const [isSelected, setIsSelected] = useState({
        isOpen: false,
        plan: '',
        daysToMake: '',
        price: ''
    })
    const loggedinUser = useSelector(state => state.userModule.user)
    const params = useParams()

    useEffect(() => {
        loadGig()

        setScreenWidth(window.innerWidth)
        window.removeEventListener('resize', onResize)
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    const onResize = () => {
        setScreenWidth(window.innerWidth)
    }

    const loadGig = async () => {
        const gigId = params.id
        try {
            const gig = await gigService.getById(gigId)
            setGig(gig)
            setReviews([...gig.reviews])
        } catch (err) {
            showErrorMsg('failed to load gigs')
        }
    }

    const onSelectPlan = (plan, daysToMake, price) => {
        setIsSelected({
            isOpen: true,
            plan,
            daysToMake,
            price
        })
        console.log(plan);
    }

    const onPurchase = (plan, daysToMake, price) => {
        if (!loggedinUser) {
            showErrorMsg("Log in First.")
            return
        }
        const newOrder = {
            seller: {
                _id: gig.owner._id,
                fullname: gig.owner.fullname
            },
            buyer: {
                _id: loggedinUser._id,
                fullname: loggedinUser.fullname
            },
            gig: {
                _id: gig._id,
                title: gig.title,
                daysToMake,
                price,
                plan
            }
        }
        orderService.save(newOrder)
        showSuccessMsg("Order Recieved")
        setIsSelected({
            isOpen: false,
            plan: '',
            daysToMake: '',
            price: ''
        })
    }

    const onCancel = () => {
        setIsSelected({
            isOpen: false,
            plan: '',
            daysToMake: '',
            price: ''
        })
    }

    const onChangeSortBy = (sortBy) => {
        const sortedReviews = gigService.sortReviews(reviews, sortBy)
        setReviews([...sortedReviews])
    }

    const onAddReview = async (userReview) => {
        try {
            if (!loggedinUser || gig.owner._id === loggedinUser._id) {
                showErrorMsg('Log in first')
                return
            }

            const newReview = {
                fullname: loggedinUser.fullname,
                txt: userReview.txt,
                rate: userReview.rate,
                imgUrl: loggedinUser.imgUrl
            }

            const review = await gigService.addReview(gig._id, newReview)
            setReviews([review, ...reviews])

        } catch (err) {
            showErrorMsg('failed to add review')
        }
    }

    if (!gig) return <div>Loading</div>
    return (
        <CssVarsProvider>
            <section className="main-gig-details">
                <div className='gig-details'>
                    <section className="gig-description">
                        <div className="gig-layout">
                            <h1>{gig.title}</h1>
                            <SellerOverview seller={gig.owner} reviews={reviews} />
                            <div className="carousel-container">
                                <GigImgsCarousel imgList={gig.imgUrls} />
                            </div>
                            <div className="mobile-plans">
                                {(screenWidth < 900) &&
                                    <GigPlans
                                        plans={gig.plans}
                                        onSelectPlan={onSelectPlan}
                                        seller={gig.owner}
                                        loggedinUser={loggedinUser}
                                    />
                                }
                            </div>
                            <div className="about-this-gig">
                                <h2>About This Gig</h2>
                                <p>{gig.description}</p>
                            </div>
                            <hr />
                            <div className="about-the-seller">
                                <h2>About the Seller</h2>
                                <SellerInfo seller={gig.owner} reviews={reviews} />
                            </div>
                            <hr />
                            {!reviews.length ?
                                <div>
                                    0 Reviews
                                    <AddReview onAddReview={onAddReview} imgUrl={(loggedinUser) ? loggedinUser.imgUrl : "https://cvhrma.org/wp-content/uploads/2015/07/default-profile-photo.jpg"} />
                                </div> :
                                <section className="reviews-container">
                                    <div className="flex space-between align-center">
                                        <div className="flex align-center reviews-title" >
                                            <h2><span>{reviews.length}</span> Reviews </h2>
                                            <ReactStars
                                                value={utilService.averageRating(reviews)}
                                                count={5}
                                                size={22}
                                                color2={'#FFB33E'}
                                                edit={false}
                                            />
                                            <b>{`${utilService.averageRating(reviews)}`}</b>
                                        </div>
                                        <div>
                                            <ReviewsFilter onChangeSortBy={onChangeSortBy} />
                                        </div>
                                    </div>
                                    <div>
                                        <AddReview onAddReview={onAddReview} imgUrl={(loggedinUser) ? loggedinUser.imgUrl : "https://cvhrma.org/wp-content/uploads/2015/07/default-profile-photo.jpg"} />
                                        <ReviewList reviews={reviews} />
                                    </div>
                                </section>
                            }
                        </div>
                    </section>
                    <section className="plans">
                        {(screenWidth > 900) &&
                            <GigPlans plans={gig.plans} onSelectPlan={onSelectPlan} />

                        }
                    </section>
                </div>
                {isSelected.isOpen && <PurchaseModal onPurchase={onPurchase} onCancel={onCancel} isSelected={isSelected} />}
            </section>
        </CssVarsProvider>

    )
}