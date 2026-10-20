import { Star } from "lucide-react";
import reviews from "@/content/google-reviews.json";
import { Icon } from "./Icons";

function Stars({ rating }: { rating: number }) {
  return <span className="google-review-stars" role="img" aria-label={`${rating} von 5 Sternen`}>{Array.from({ length: 5 }, (_, i) => <Star key={i} aria-hidden="true" fill={i < rating ? "currentColor" : "none"} />)}</span>;
}

export function GoogleReviews() {
  const checkedAt = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(`${reviews.checkedAt}T00:00:00Z`));
  return <section className="section google-reviews" aria-labelledby="google-reviews-title" id="bewertungen"><div className="container">
    <div className="google-reviews-heading"><div><h2 id="google-reviews-title">Das sagen unsere Kunden</h2><p>Bewertungen für {reviews.businessName} auf Google.</p></div><a className="google-rating-summary" href={reviews.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`${reviews.rating.toFixed(1).replace(".", ",")} von 5 Sternen aus ${reviews.reviewCount} Rezensionen – auf Google Maps ansehen`}><strong>{reviews.rating.toFixed(1).replace(".", ",")}<span>/ 5</span></strong><span><Stars rating={reviews.rating} /><span className="google-rating-count">{reviews.reviewCount} Rezensionen auf Google <Icon name="arrowUp" /></span></span></a></div>
    <div className="google-review-grid">{reviews.reviews.map(review => <article className="google-review" key={review.author} aria-label={`Google-Bewertung von ${review.author}`}><div className="google-review-author"><span className="google-review-avatar" aria-hidden="true">{review.author.split(" ").map(part => part[0]).join("")}</span><div><h3>{review.author}</h3><span>Google-Rezension</span></div></div><Stars rating={review.rating} />{review.excerpt ? <><blockquote><p>„{review.excerpt}“</p></blockquote><span className="google-review-excerpt">Auszug aus der Rezension</span></> : <p className="google-review-without-text">Bewertung ohne Rezensionstext.</p>}</article>)}</div>
    <div className="google-reviews-footer"><p>Quelle: Google Maps · Stand: <time dateTime={reviews.checkedAt}>{checkedAt}</time></p><a className="text-link" href={reviews.sourceUrl} target="_blank" rel="noopener noreferrer">Alle Bewertungen auf Google ansehen<Icon name="arrowUp" /></a></div>
  </div></section>;
}
