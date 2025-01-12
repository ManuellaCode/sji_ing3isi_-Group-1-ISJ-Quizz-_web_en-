AOS.init();

        document.getElementById('exit').addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default anchor behavior

            // Clear previous error messages
            const errors = document.querySelectorAll('.error');
            errors.forEach(error => error.textContent = '');

            let valid = true;

            // Get input values
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();

            // Validate input fields
            if (name.length < 2) {
                document.getElementById('nameError').textContent = 'Name must be at least 2 characters.';
                valid = false;
            }
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                document.getElementById('emailError').textContent = 'Please enter a valid email address.';
                valid = false;
            }
            if (phone && !/^\d{10}$/.test(phone)) {
                document.getElementById('phoneError').textContent = 'Phone must be 10 digits.';
                valid = false;
            }
            if (subject.length < 2) {
                document.getElementById('subjectError').textContent = 'Subject must be at least 2 characters.';
                valid = false;
            }
            if (message.length < 10) {
                document.getElementById('messageError').textContent = 'Message must be at least 10 characters.';
                valid = false;
            }

            // If all fields are valid, create a mailto link
            if (valid) {
                const mailtoLink = `mailto:foinrooney@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`)}`;
                window.location.href = mailtoLink; // Redirect to mailto link
            }
        });