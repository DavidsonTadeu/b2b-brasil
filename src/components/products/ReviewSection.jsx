import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import moment from 'moment';

export default function ReviewSection({ productId, user }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    base44.entities.Review.filter({ product_id: productId }, '-created_date', 20).then(data => {
      setReviews(data);
      setLoading(false);
    });
  }, [productId]);

  const handleSubmit = async () => {
    if (!user || user.role !== 'buyer') return;
    setSubmitting(true);
    const newReview = await base44.entities.Review.create({
      product_id: productId,
      buyer_id: user.id,
      buyer_name: user.full_name,
      rating,
      comment,
    });
    setReviews([newReview, ...reviews]);
    setComment('');
    setRating(5);
    toast({ title: 'Avaliação enviada!' });
    setSubmitting(false);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-xl">Avaliações</h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`h-4 w-4 ${s <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />)}</div>
            <span className="text-sm font-medium">{avgRating} ({reviews.length})</span>
          </div>
        )}
      </div>

      {user?.role === 'buyer' && user?.account_status === 'approved' && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sua nota:</span>
            <div className="flex">{[1,2,3,4,5].map(s => (
              <button key={s} onClick={() => setRating(s)}>
                <Star className={`h-5 w-5 transition-colors ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30 hover:text-amber-300'}`} />
              </button>
            ))}</div>
          </div>
          <Textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Conte sua experiência com este produto..."
            rows={2}
          />
          <Button size="sm" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Enviar Avaliação
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : reviews.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Nenhuma avaliação ainda</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {r.buyer_name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{r.buyer_name}</p>
                    <p className="text-xs text-muted-foreground">{moment(r.created_date).fromNow()}</p>
                  </div>
                </div>
                <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />)}</div>
              </div>
              {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}