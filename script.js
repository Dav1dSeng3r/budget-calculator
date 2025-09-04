// This script provides the core interactivity for the Budget Calculator prototype.
// It handles modal popups, calculations, data persistence, and filtering.

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Global Element Selectors ---
    const modal = document.getElementById('budget-calculator-modal');
    const openBtn = document.getElementById('open-calculator-btn');
    const closeBtn = document.querySelector('.close-btn');
    const budgetForm = document.getElementById('budget-form');

    const monthlyPaymentInput = document.getElementById('monthly-payment');
    const downPaymentInput = document.getElementById('down-payment');
    const tradeInInput = document.getElementById('trade-in');
    const loanTermSelect = document.getElementById('loan-term');
    const interestRateSelect = document.getElementById('interest-rate');
    const suggestedPriceOutput = document.getElementById('suggested-price-output');
    
    // --- Page-Specific Logic ---
    const isHomePage = document.body.id === 'home-page';
    const isVipPage = document.body.querySelector('.vip-content') !== null;
    
    if (isHomePage) {
        initHomePage();
    } else if (isVipPage) {
        initVipPage();
    } else {
        initSrpPage();
    }

    // --- Event Listeners ---
    if (openBtn) {
        openBtn.addEventListener('click', () => {
            loadBudgetFromStorage();
            if (isVipPage) {
                modal.classList.add('vip-mode');
            } else {
                modal.classList.remove('vip-mode');
            }
            modal.style.display = 'flex';
        });
    }
    if (closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (event) => {
        if (event.target === modal) modal.style.display = 'none';
    });

    if (budgetForm) {
        budgetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const budget = getBudgetInputs();
            
            // Only calculate suggested price if not on the VIP page
            if (!isVipPage) {
                const suggestedPrice = parseFloat(suggestedPriceOutput.textContent.replace(/[€.]/g, '').replace(',', '.'));
                if (!isNaN(suggestedPrice) && suggestedPrice > 0) {
                    budget.suggestedVehiclePrice = suggestedPrice;
                }
            }

            saveBudgetToStorage(budget);
            modal.style.display = 'none';
            
            // [FIX] Corrected logic to handle actions based on the current page
            if (isVipPage) {
                // On VIP, just update the display in place.
                updateVipDisplay(budget);
            } else if (isHomePage) {
                // On Home, redirect to the SRP.
                window.location.href = 'index.html';
            } else {
                // On SRP, update the listings and filter in place.
                updateAllListings(budget);
                filterSrp(budget);
            }
        });
    }

    const inputsToMonitor = [monthlyPaymentInput, downPaymentInput, tradeInInput, loanTermSelect, interestRateSelect];
    inputsToMonitor.forEach(input => {
        if (input) input.addEventListener('input', updateSuggestedPrice);
    });
    
    // --- CORE FUNCTIONS ---

    function initHomePage() { /* No special init needed */ }
    
    function initSrpPage() {
        const budget = getBudgetFromStorage();
        if (budget) {
            updateAllListings(budget);
            filterSrp(budget);
        }
        
        document.querySelectorAll('.car-card').forEach(card => {
            card.addEventListener('click', () => {
                const carData = {
                    name: card.dataset.carName,
                    price: parseFloat(card.dataset.price),
                    img: card.querySelector('img').src,
                };
                localStorage.setItem('selectedCar', JSON.stringify(carData));
            });
        });
    }

    function initVipPage() {
        const carData = JSON.parse(localStorage.getItem('selectedCar'));
        if (carData) {
            document.getElementById('vip-car-name').textContent = carData.name;
            document.getElementById('vip-car-price').textContent = `€${carData.price.toLocaleString()}`;
            document.getElementById('vip-car-img').src = carData.img.replace('300x200', '600x400');
            document.body.dataset.carPrice = carData.price;
        }

        const budget = getBudgetFromStorage();
        if (budget) updateVipDisplay(budget);

        const requestBtn = document.getElementById('request-financing-btn');
        if(requestBtn) requestBtn.addEventListener('click', () => alert('Financing request sent to the dealer! (Prototype Action)'));
    }

    // --- Calculation, Filtering, and DOM Updates ---

    function filterSrp(budget) {
        const notificationEl = document.getElementById('srp-notification');
        if (!budget || !budget.suggestedVehiclePrice || budget.suggestedVehiclePrice <= 0) {
            if(notificationEl) notificationEl.style.display = 'none';
            // Show all cards if there is no filter budget
            document.querySelectorAll('.car-card').forEach(card => card.style.display = 'block');
            return; 
        }
        
        let visibleCount = 0;
        document.querySelectorAll('.car-card').forEach(card => {
            const price = parseFloat(card.dataset.price);
            if (price <= budget.suggestedVehiclePrice) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (notificationEl) {
            notificationEl.textContent = `Showing ${visibleCount} cars matching your budget of €${budget.suggestedVehiclePrice.toLocaleString('de-DE')}.`;
            notificationEl.style.display = 'block';
        }
    }

    function calculateVehiclePrice(budget) {
        const M = budget.desiredMonthlyPayment;
        if (!M || M <= 0) return 0;
        const r = (budget.interestRate / 100) / 12;
        const n = budget.loanTerm;
        let P;
        if (r > 0) {
            P = (M * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
        } else {
            P = M * n;
        }
        return P + budget.downPayment + budget.tradeIn;
    }

    function updateSuggestedPrice() {
        const budget = getBudgetInputs();
        const vehiclePrice = calculateVehiclePrice(budget);
        if (suggestedPriceOutput) {
            suggestedPriceOutput.textContent = `€${vehiclePrice.toLocaleString('de-DE', { maximumFractionDigits: 0 })}`;
        }
    }

    function calculateMonthlyPayment(price, budget) {
        const principal = price - budget.downPayment - budget.tradeIn;
        if (principal <= 0) return 0;
        const r = (budget.interestRate / 100) / 12;
        const n = budget.loanTerm;
        if (r === 0) return principal / n;
        return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    function updateAllListings(budget) {
        document.querySelectorAll('.car-card').forEach(card => {
            const price = parseFloat(card.dataset.price);
            const paymentEl = card.querySelector('.monthly-payment');
            const monthlyPayment = calculateMonthlyPayment(price, budget);

            if (monthlyPayment > 0) {
                paymentEl.textContent = `from €${monthlyPayment.toFixed(0)}/mo`;
                paymentEl.classList.remove('initial-state');
            } else {
                paymentEl.textContent = '€--/mo · unable to calculate a payments';
                paymentEl.classList.add('initial-state');
            }
        });
    }

    function updateVipDisplay(budget) {
        const price = parseFloat(document.body.dataset.carPrice);
        const paymentEl = document.getElementById('vip-monthly-payment');
        const monthlyPayment = calculateMonthlyPayment(price, budget);
        
        if (monthlyPayment > 0) {
            paymentEl.textContent = `€${monthlyPayment.toFixed(0)}/mo`;
            paymentEl.classList.remove('initial-state');
        } else {
            paymentEl.textContent = '€--/mo · unable to calculate a payments';
            paymentEl.classList.add('initial-state');
        }
        
        document.getElementById('vip-prompt').style.display = 'none';
        const breakdown = document.getElementById('finance-breakdown');
        breakdown.style.display = 'block';
        document.getElementById('summary-down-payment').textContent = `€${budget.downPayment.toLocaleString()}`;
        document.getElementById('summary-trade-in').textContent = `€${budget.tradeIn.toLocaleString()}`;
        document.getElementById('summary-term').textContent = `${budget.loanTerm} months`;
        document.getElementById('summary-rate').textContent = `${budget.interestRate}%`;
    }

    // --- Data Persistence ---

    function getBudgetInputs() {
        return {
            desiredMonthlyPayment: parseFloat(document.getElementById('monthly-payment')?.value) || 0,
            downPayment: parseFloat(document.getElementById('down-payment')?.value) || 0,
            tradeIn: parseFloat(document.getElementById('trade-in')?.value) || 0,
            loanTerm: parseInt(document.getElementById('loan-term')?.value, 10),
            interestRate: parseFloat(document.getElementById('interest-rate')?.value),
        };
    }

    function saveBudgetToStorage(budget) {
        localStorage.setItem('userBudget', JSON.stringify(budget));
    }



    function getBudgetFromStorage() {
        const budget = localStorage.getItem('userBudget');
        return budget ? JSON.parse(budget) : null;
    }

    function loadBudgetFromStorage() {
        const budget = getBudgetFromStorage();
        if (budget) {
            if (document.getElementById('monthly-payment') && budget.desiredMonthlyPayment) {
                document.getElementById('monthly-payment').value = budget.desiredMonthlyPayment;
            } else if (document.getElementById('monthly-payment')) {
                document.getElementById('monthly-payment').value = '';
            }
            if (document.getElementById('down-payment')) document.getElementById('down-payment').value = budget.downPayment;
            if (document.getElementById('trade-in')) document.getElementById('trade-in').value = budget.tradeIn;
            if (document.getElementById('loan-term')) document.getElementById('loan-term').value = budget.loanTerm;
            if (document.getElementById('interest-rate')) document.getElementById('interest-rate').value = budget.interestRate;
            updateSuggestedPrice();
        }
    }
});