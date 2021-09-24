        socket = null
        lastInput = ""
        dmp = new diff_match_patch()
        waitingfor = true
        talkbox = null
        otherbox = null
        inputmax = 58

        $.prototype.setBoxColor = (color) ->
          prop = backgroundColor: color
          @animate prop, 200

        $.prototype.scrollBottom = ->
          @[0].scrollTop = @[0].scrollHeight

        drainBuffer = ->
          ib = ($ '#input-box')
          ip = ($ '#input-scrollback')
          p = $ "<p></p>"
          p.text ib.val()
          p.insertBefore $('#input-box')
          ib.val ''
          lastInput = ""
          socket.emit 'newline', token: '<%= @room %>'
          ip.scrollBottom()

        sendBuffer = ->
          curbuf = $('#input-box').val()
          socket.emit 'resetBuffer',
            currentBuffer: curbuf
            token: '<%= @room %>'

        handleResetBuffer = (data) ->
          if data? and data.currentBuffer?
            otherscrollback = ($ "#other-scrollback")
            lines = otherscrollback.children()
            cur = lines[lines.length - 1]
            cur.textContent = data.currentBuffer

        handlePartnerJoin = (data) ->
          enableInput()
          if waitingfor
            osb = ($ '#other-scrollback')
            osb.empty()
            waitingfor = false
          insertNotice 'User connected.'
          sendBuffer()

        handleDenyJoin = ->
          tb = ($ '#you-box')
          bb = ($ '#them-box')
          if tb?
            tb.remove()
          if bb?
            bb.remove()
          b = ($ 'body')
          b.html '''
            <p>Two people are already talking here. Did someone forget to close a window?<p><p><a href="/">Try starting a new chat.</a></p>
          '''

        removeCurrentLineClass = (scrollbackElem) ->
          ps = scrollbackElem.children 'p.current-line'
          for cp in ps
            $(ps).removeClass 'current-line'

        insertNotice = (message) ->
          osb = ($ '#other-scrollback')
          removeCurrentLineClass osb
          dnotice = ($ "<p class=\"notice\">#{message}</p><p class=\"current-line\"></p>")
          osb.append dnotice

        disableInput = ->
          ib = $('#input-box')
          ib[0].blur()
          ib.attr 'disabled', true
          otherbox.setBoxColor '#DDDDDD'
          ib.attr 'placeholder', 'Waiting for a friend to come back.'
          ibb = ib.parent '.talkbox'

        enableInput = ->
          ib = $('#input-box')
          ib.attr 'disabled', false
          otherbox.setBoxColor '#FFFFFF'
          ib.attr 'placeholder', 'Just start typing.'
          ib[0].focus()

        handleUserDisconnect = (data) ->
          insertNotice 'User disconnected.'
          disableInput()

        forceSend = ->
          ib = $ '#input-box'
          words = ib.val().split ' '
          ib.val words[0..words.length - 2].join ' '
          doDiff ib.val()
          drainBuffer()
          if words.length > 1
            ib.val words[words.length - 1]
          doDiff ib.val()

        doDiff = (val) ->
          oldInput = lastInput
          lastInput = val
          if oldInput == lastInput
            return
          res = dmp.patch_make(oldInput, val)
          socket.emit 'diff', diff: res, token: '<%= @room %>'
          #diffBox res, ($ '#input-scrollback')

        handleNewline = ->
          osb = ($ '#other-scrollback')
          removeCurrentLineClass osb
          osb.append ($ '<p class="current-line"></p>')
          osb.scrollBottom()

        diffBox = (diff, scrollback=($ "#other-scrollback")) ->
          lines = scrollback.children()
          old = lines[lines.length - 1]
          res = dmp.patch_apply diff, old.textContent
          old.textContent = res[0]
          scrollback.scrollBottom()

        handleDiff = (diff) -> diffBox diff

        letters = 'abcdefghkmnpqrstuvwxyz23456789'
        sendJoin = (e) ->
          token = ''
          for num in [1..6]
            token += letters[Math.floor(Math.random() * letters.length)]
          window.location = "/#{token}"
          false

        ($ document).keydown (ev) ->
          if ev.target == @ or (ev.ctrlKey? and ev.ctrlKey)
            return true
          ibfocused = $('#input-box').data 'focused'
          if not ibfocused? or not ibfocused
            ($ '#input-box').focus()
            doitman = -> $('#input-box').trigger ev
            setTimeout doitman, 100
          return true

        ($ document).ready () ->
          socket = io.connect "http://<%= @config.publicHost %>:<%= @config.publicPort + 1%>"
          socket.on 'joinResponse', (data) ->
            handleJoinResponse data

          socket.on 'partnerJoin', handlePartnerJoin
          socket.on 'userDisconnect', handleUserDisconnect
          socket.on 'denyJoin', handleDenyJoin
          socket.on 'newline', handleNewline
          socket.on 'kick', (data) ->
          socket.on 'resetBuffer', handleResetBuffer
          socket.on 'diff', (data) -> handleDiff data.diff

          <% if @home? and @home: %>
          chatButton = ($ '#chat')
          chatButton.bind 'click', sendJoin
          <% else: %>
          otherbox = ($ '#them-box')
          talkbox = ($ '#you-box')
          if not talkbox?
            window.location = "/"
          if not talkbox?
            window.location = "/"
          talkbox.html """
            <div class="scrollback" id="input-scrollback">
                <input class="chat" placeholder="Waiting for your friend to arrive." id="input-box">
            </div>
            """
          ib = ($ "#input-box")
          ib.data 'focused', false
          ib.attr 'disabled', true
          ib.keydown (ev) ->
            keycode = ev.charCode || ev.keyCode
            if keycode != 13
              if ev.target == @
                return true
              return false
            drainBuffer()
            if ev.target == @
              return true
            return false

          ib.focus (ev) ->
            $(@).data 'focused', true

          ib.blur (ev) ->
            $(@).data 'focused', false

          ib.bind 'keyup change', (ev) ->
            doDiff ib.val()
            if ib.val().length >= inputmax
              forceSend()
            true

          otherbox.html '''
            <div class="scrollback" id="other-scrollback">
            <p>
            Give your friend this link:
<a id="publiclink" href="<%= @publicLink %>"><%- @publicLink %></a> <!-- <a href="#" id="copy-publiclink">[copy]</a> -->

            </p>
            </div>
            '''

            handlePartnerJoin()
          talkbox.setBoxColor '#FFFFFF'
          socket.emit 'requestJoin', token: '<%= @room %>'
