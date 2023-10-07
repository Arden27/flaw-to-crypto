document.addEventListener("DOMContentLoaded", () => {
    $(function() {
        //let prices = {{ prices|safe }}; // declared in template
        let min = 0;
        let max = prices.length - 1;
        let currentPrice = prices[max][1];
        let priceMin = 0;
        let priceMax = currentPrice * 10;
        let selectedPrice = currentPrice;
    
        function calculateTotalInvestment(sliderValue, priceForCalculation) {
            let dailyInvestment = $("#dailyInvestment").val();
            if (dailyInvestment && sliderValue !== max) {
                let totalBitcoin = 0;
                let investmentDays = max - sliderValue + 1;
                for (let i = sliderValue; i <= max; i++) {
                    let priceData = prices[i];
                    let price = priceData[1];
                    let bitcoinPurchased = dailyInvestment / price;
                    totalBitcoin += bitcoinPurchased;
                }
                let totalValue = totalBitcoin * priceForCalculation;
                let initialInvestment = dailyInvestment * investmentDays;
                /*
                $("#totalInvestment").text(`Total value of investment: $${totalValue.toFixed(2)}`);
                $("#totalBitcoin").text(`Total Bitcoin purchased: ${totalBitcoin.toFixed(8)}`);
                $("#initialInvestment").text(`Sum of initial investments: $${initialInvestment}`);
                */
                //$("#investmentDetails").text(`Investing $${dailyInvestment}/day for ${investmentDays} days ($${initialInvestment} total), you'd now have ${totalBitcoin.toFixed(8)} BTC worth $${totalValue.toFixed(2)} at current rate $${selectedPrice.toFixed(2)}.`);
    
                // Update daily investment and the following text
    
                $("#dailyInvestment").next().text(`/day for ${investmentDays} days ($${initialInvestment} total), you'd now have ${totalBitcoin.toFixed(8)} BTC worth $${totalValue.toFixed(2)} at current rate $${selectedPrice.toFixed(2)}.`);
            }
        }
    
        $("#slider").slider({
            range: "max",
            min: min,
            max: max,
            value: max,
            slide: function(event, ui) {
                let currentPriceData = prices[ui.value];
                let timestamp = currentPriceData[0] / 1000;
                let date = new Date(timestamp * 1000).toISOString().split('T')[0];
                let currentPrice = prices[ui.value][1];
                $(this).find(".date-slider-text").html(`${date}`);
                $(this).find(".past-price-slider-text").html(`$${currentPrice.toFixed(2)}`);
                calculateTotalInvestment(ui.value, selectedPrice);
            },
            create: function() {
                let handle = $(this).find(".ui-slider-handle");
                handle.append('<span class="date-slider-text"></span>');
                handle.append('<span class="past-price-slider-text"></span>');
            }
        });
    
        let draggingPriceSlider = false;
    
        $("#priceSlider").slider({
            orientation: "vertical",
            range: "max",
            min: priceMin,
            max: priceMax,
            value: currentPrice,
            slide: function(event, ui) {
                selectedPrice = ui.value;
                $(this).find(".price-slider-text").text(`$${selectedPrice.toFixed(2)}`);
                $(".price-slider-text").show();
                calculateTotalInvestment($("#slider").slider("value"), selectedPrice);
            },
            create: function() {
                let handle = $(this).find(".ui-slider-handle");
                handle.append('<span class="price-slider-text">$' + $(this).slider('value').toFixed(2) + '</span>');
                $(".price-slider-text").hide();
            },
            start: function(event, ui) {
                draggingPriceSlider = true; // Update flag when dragging starts
            },
            stop: function(event, ui) {
                draggingPriceSlider = false; // Update flag when dragging stops
                if (!$("#priceSlider").is(":hover")) {
                    $(".price-slider-text").fadeOut();
                }
            }
            /*
            stop: function(event, ui) {
                $(".price-slider-text").fadeOut();
            }
            */
        });
    
        // Show price slider text when mouse is over the price slider
        $(".price-slider-container").mouseenter(function() {
            $(this).find(".price-slider-text").stop().fadeIn();
        });
    
        // Hide price slider text when mouse leaves the price slider
        $(".price-slider-container").mouseleave(function() {
            if (!draggingPriceSlider) {
                $(this).find(".price-slider-text").stop().fadeOut();
            }
        });
    
        $("#dailyInvestment").on("input", function() {
            let newWidth = $(this).val().length > 1 ? $(this).val().length * 10 + 'px' : '12px';
            $(this).css('width', newWidth);
            calculateTotalInvestment($("#slider").slider("value"), selectedPrice);
    
            // Update the text based on whether there's input
            if ($(this).val().length > 0 && $("#slider").slider("value") === max) {
                $("#investmentPeriod").fadeOut(function() {
                    $(this).text("/day. Now use slider.").fadeIn();
                });
            } else if ($(this).val().length === 0) {
                $("#investmentPeriod").fadeOut(function() {
                    $(this).text("per day").fadeIn(); // Reset the text when the input field is empty
                });
            } else {
                calculateTotalInvestment($("#slider").slider("value"), selectedPrice);
            }
        });
    
        // Listen for a click event on the reset button
        $("#resetPrice").on("click", function() {
            // Reset the price slider's value to the current price
            $("#priceSlider").slider("value", currentPrice);
            // Update the selected price and recalculate the total investment
            selectedPrice = currentPrice;
            calculateTotalInvestment($("#slider").slider("value"), selectedPrice);
            // Update the handle text of the price slider
            $("#priceSlider").find(".price-slider-text").text(`$${currentPrice.toFixed(2)}`);
        });
    
        // Trigger the slide event to display the initial price
        $("#slider").slider("value", max);
    
        // Create chart data
        let chartLabels = prices.map(item => new Date(item[0]).toISOString().split('T')[0]);
        let chartData = prices.map(item => item[1]);
    
        // Create chart
        let ctx = document.getElementById('bitcoinChart').getContext('2d');
        let myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Bitcoin Price',
                    data: chartData,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    });
});