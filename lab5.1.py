import random

# Transition matrix
P = [[0.8, 0.1, 0.1],
     [0.2, 0.6, 0.2],
     [0.1, 0.1, 0.8]]

# Initial state
x = 0

# Total time
T = 0

# Total time spent in each state
j_state_time = [0, 0, 0]

# Number of transitions
num_transitions = 1000

for i in range(num_transitions):
    # Choose a random next state based on transition probabilities
    next_state = random.choices([0, 1, 2], weights=P[x], k=1)[0]
    # Increment time
    T += 1
    # Increment time spent in current state
    j_state_time[x] += 1
    # Update current state
    x = next_state

# Calculate experimental probability for each state
experimental_probability = [j / T for j in j_state_time]

print("Experimental Probability:", experimental_probability)
