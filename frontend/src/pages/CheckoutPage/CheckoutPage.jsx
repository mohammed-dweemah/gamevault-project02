import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { id }             = useParams();
  const navigate           = useNavigate();
  const { user }           = useAuth();

  const [game, setGame]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep]       = useState(1); // 1: details, 2: payment, 3: success
  const [form, setForm]       = useState({
    fullName:   user?.name  || '',
    email:      user?.email || '',
    cardNumber: '',
    expiry:     '',
    cvv:        '',
  });
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors]         = useState({});
  const [purchaseError, setPurchaseError] = useState('');

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const res = await API.get(`/games/${id}`);
        const g   = res.data.game;

        // Check if already owned — redirect to My Games
        const alreadyOwned = g.purchasedBy?.some(uid => String(uid) === String(user?._id));
        if (alreadyOwned) {
          navigate('/my-games');
          return;
        }
        setGame(g);
      } catch {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [id]);

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === 'cardNumber') {
      value = value.replace(/\D/g, '').slice(0, 16);
      value = value.replace(/(.{4})/g, '$1 ').trim();
    }
    if (name === 'expiry') {
      value = value.replace(/\D/g, '').slice(0, 4);
      if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2);
    }
    if (name === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 3);
    }

    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateStep1 = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Name is required';
    if (!form.email.trim())    errs.email    = 'Email is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    const rawCard = form.cardNumber.replace(/\s/g, '');
    if (rawCard.length !== 16)          errs.cardNumber = 'Enter a valid 16-digit card number';
    if (!form.expiry || form.expiry.length < 5) errs.expiry = 'Enter a valid expiry date';
    if (!form.cvv || form.cvv.length < 3)       errs.cvv    = 'Enter a valid CVV';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
  };

  const handlePurchase = async () => {
    if (!validateStep2()) return;
    setProcessing(true);
    setPurchaseError('');

    // Simulate payment processing delay
    await new Promise(r => setTimeout(r, 2000));

    try {
      // Call backend to record the purchase
      await API.post(`/games/${id}/purchase`);
      setStep(3);
    } catch (err) {
      setPurchaseError(err.response?.data?.message || 'Purchase failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <main className="checkout-page">
      <div className="checkout-page__loading">Loading...</div>
    </main>
  );

  if (!game) return null;

  return (
    <main className="checkout-page">
      <div className="checkout-page__bg-glow" />

      <div className="checkout-page__container">

        {/* ── Step 3 — Success ───────────────────────── */}
        {step === 3 ? (
          <div className="checkout-success">
            <div className="checkout-success__icon">✓</div>
            <h1 className="checkout-success__title">Purchase Complete!</h1>
            <p className="checkout-success__subtitle">
              Thank you <strong>{form.fullName}</strong>!{' '}
              <strong>{game.title}</strong> is now in your library.
            </p>
            <p className="checkout-success__email">
              A confirmation has been sent to <strong>{form.email}</strong>
            </p>
            <div className="checkout-success__game">
              <span className="checkout-success__game-title">{game.title}</span>
              <span className="checkout-success__game-price">${game.price}</span>
            </div>
            <div className="checkout-success__actions">
              <button className="checkout-success__home-btn" onClick={() => navigate('/')}>
                Back to Library
              </button>
              <button className="checkout-success__mygames-btn" onClick={() => navigate('/my-games')}>
                My Games
              </button>
            </div>
          </div>

        ) : (
          <>
            {/* Header */}
            <div className="checkout-page__header">
              <button className="checkout-page__back" onClick={() => step === 1 ? navigate(-1) : setStep(1)}>
                ← {step === 1 ? 'Back' : 'Back to Details'}
              </button>
              <span className="checkout-page__eyebrow">◈ Checkout</span>
            </div>

            <div className="checkout-page__layout">
              {/* Left — Form */}
              <div className="checkout-page__form-section">

                {/* Progress */}
                <div className="checkout-steps">
                  <div className={`checkout-step ${step >= 1 ? 'checkout-step--active' : ''}`}>
                    <span className="checkout-step__num">1</span>
                    <span>Details</span>
                  </div>
                  <div className="checkout-steps__line" />
                  <div className={`checkout-step ${step >= 2 ? 'checkout-step--active' : ''}`}>
                    <span className="checkout-step__num">2</span>
                    <span>Payment</span>
                  </div>
                </div>

                {/* Step 1 — Personal Info */}
                {step === 1 && (
                  <div className="checkout-form">
                    <h2 className="checkout-form__title">Personal Details</h2>

                    <div className="checkout-form__group">
                      <label className="checkout-form__label">Full Name</label>
                      <input
                        type="text" name="fullName" value={form.fullName}
                        onChange={handleChange} placeholder="John Doe"
                        className={`checkout-form__input ${errors.fullName ? 'checkout-form__input--error' : ''}`}
                      />
                      {errors.fullName && <span className="checkout-form__error">{errors.fullName}</span>}
                    </div>

                    <div className="checkout-form__group">
                      <label className="checkout-form__label">Email Address</label>
                      <input
                        type="email" name="email" value={form.email}
                        onChange={handleChange} placeholder="you@example.com"
                        className={`checkout-form__input ${errors.email ? 'checkout-form__input--error' : ''}`}
                      />
                      {errors.email && <span className="checkout-form__error">{errors.email}</span>}
                    </div>

                    <button className="checkout-form__next" onClick={handleNext}>
                      Continue to Payment →
                    </button>
                  </div>
                )}

                {/* Step 2 — Payment */}
                {step === 2 && (
                  <div className="checkout-form">
                    <h2 className="checkout-form__title">Payment Details</h2>

                    {purchaseError && (
                      <div className="checkout-form__purchase-error">{purchaseError}</div>
                    )}

                    <div className="checkout-form__group">
                      <label className="checkout-form__label">Card Number</label>
                      <div className="checkout-form__card-input">
                        <input
                          type="text" name="cardNumber" value={form.cardNumber}
                          onChange={handleChange} placeholder="0000 0000 0000 0000"
                          className={`checkout-form__input ${errors.cardNumber ? 'checkout-form__input--error' : ''}`}
                        />
                        <span className="checkout-form__card-icon">💳</span>
                      </div>
                      {errors.cardNumber && <span className="checkout-form__error">{errors.cardNumber}</span>}
                    </div>

                    <div className="checkout-form__row">
                      <div className="checkout-form__group">
                        <label className="checkout-form__label">Expiry Date</label>
                        <input
                          type="text" name="expiry" value={form.expiry}
                          onChange={handleChange} placeholder="MM/YY"
                          className={`checkout-form__input ${errors.expiry ? 'checkout-form__input--error' : ''}`}
                        />
                        {errors.expiry && <span className="checkout-form__error">{errors.expiry}</span>}
                      </div>
                      <div className="checkout-form__group">
                        <label className="checkout-form__label">CVV</label>
                        <input
                          type="text" name="cvv" value={form.cvv}
                          onChange={handleChange} placeholder="123"
                          className={`checkout-form__input ${errors.cvv ? 'checkout-form__input--error' : ''}`}
                        />
                        {errors.cvv && <span className="checkout-form__error">{errors.cvv}</span>}
                      </div>
                    </div>

                    <div className="checkout-form__secure">
                      🔒 Your payment info is encrypted and secure
                    </div>

                    <button
                      className="checkout-form__pay"
                      onClick={handlePurchase}
                      disabled={processing}
                    >
                      {processing ? (
                        <span className="checkout-form__processing">
                          <span className="checkout-form__spinner" />
                          Processing...
                        </span>
                      ) : (
                        `Pay $${game.price}`
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Right — Order Summary */}
              <div className="checkout-page__summary">
                <h3 className="checkout-summary__title">Order Summary</h3>
                <div className="checkout-summary__game">
                  <div className="checkout-summary__cover">
                    {game.cover ? (
                      <img src={game.cover} alt={game.title} />
                    ) : (
                      <div className="checkout-summary__cover-fallback">
                        {game.title?.slice(0, 3).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="checkout-summary__info">
                    <h4>{game.title}</h4>
                    <p>{game.developer}</p>
                    <p>{game.platform}</p>
                  </div>
                </div>

                <div className="checkout-summary__line">
                  <span>Price</span>
                  <span>${game.price}</span>
                </div>
                <div className="checkout-summary__line">
                  <span>Tax</span>
                  <span>${(game.price * 0.15).toFixed(2)}</span>
                </div>
                <div className="checkout-summary__total">
                  <span>Total</span>
                  <span>${(game.price * 1.15).toFixed(2)}</span>
                </div>

                <div className="checkout-summary__tags">
                  {game.tags?.map(tag => (
                    <span key={tag} className="checkout-summary__tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default CheckoutPage;
