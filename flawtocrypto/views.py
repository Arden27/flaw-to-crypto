from django.shortcuts import render
import requests
from datetime import datetime, timedelta

def get_historical_bitcoin_price(days="max"):
    # Define the API endpoint and send a request to CoinGecko to get historical Bitcoin prices
    url = f"https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days={days}"
    response = requests.get(url)
    data = response.json()
    prices = data['prices']

    # Convert the timestamps to dates and check for consecutive duplicate dates
    last_date = datetime.fromtimestamp(prices[-1][0] / 1000).date()
    second_last_date = datetime.fromtimestamp(prices[-2][0] / 1000).date()

    if last_date == second_last_date:
        prices.pop(-2)  # Remove the second to last item if it's a duplicate

    # Initialize an empty list to hold the new prices with filled gaps
    new_prices = []
    prev_date = None
    for i in range(len(prices) - 1, -1, -1):
        curr_date = datetime.fromtimestamp(prices[i][0] / 1000).date()
        curr_price = prices[i][1]

        # Check for date gaps in the historical data and fill them with average prices
        if prev_date and curr_date < prev_date - timedelta(days=1):
            # Compute the number of days in the gap
            gap_days = (prev_date - curr_date).days
            prev_price = prices[i + 1][1]

            # Fill the gaps with average prices
            for gap_day in range(1, gap_days):
                gap_date = datetime.combine(curr_date + timedelta(days=gap_day), datetime.min.time())
                gap_price = curr_price + (gap_day / gap_days) * (prev_price - curr_price)
                new_prices.append([int(gap_date.timestamp() * 1000), gap_price])
                print(f"Filled gap from {curr_date} to {prev_date} with date {gap_date.date()} and price {gap_price}")

        # Append the current price to the new prices list
        new_prices.append(prices[i])
        prev_date = curr_date

    # Reverse the list to maintain chronological order
    new_prices.reverse()
    
    # Return the updated prices list
    return new_prices

def home(request):
    # Call the function to get historical prices
    prices = get_historical_bitcoin_price()
    
    # Prepare the context with the historical prices
    context = {
        'prices': prices,
    }
    
    # Render the home page with the historical prices data
    return render(request, 'flawtocrypto/index.html', context)
