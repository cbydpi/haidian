mui.ready(function() {
  mui.init();
  document.addEventListener('plusready', function() {
    document.addEventListener('touchstart', function() {
      vm.slidertime = 0
    })
    Date.prototype.Format = function(formatStr) {
      var str = formatStr

      str = str.replace(/yyyy|YYYY/, this.getFullYear())
      var month = this.getMonth() + 1
      str = str.replace(/MM/, month > 9 ? month.toString() : '0' + month)
      str = str.replace(/dd|DD/, this.getDate() > 9 ? this.getDate().toString() : '0' + this.getDate())
      str = str.replace(/hh|HH/, this.getHours() > 9 ? this.getHours().toString() : '0' + this.getHours())
      str = str.replace(/mm/, this.getMinutes() > 9 ? this.getMinutes().toString() : '0' + this.getMinutes())
      str = str.replace(/ss|SS/, this.getSeconds() > 9 ? this.getSeconds().toString() : '0' + this.getSeconds())
      return str
    }

    var vm = new Vue({
      el: '#app',
      data: {
        isInit: false,
        slidertime: 0,
        play: null,
        SW: null,
        policyData: null,
        baseURL: 'http://39.105.41.93:8383/nature/',
        mouseX: null,
        mouseY: null,
        objX: null,
        objY: null,
        isDowm: false,
        datetime: null,
        slidetime: null,
        showPolicyInfo: false,
        showBigdataList: false,
        showBigdataInfo: false,
        policyInfo: null,
        showPolicy: false,
        showBigdata: true,
        showNotice: true,
        showActivity: true,
        showSlide: true,
        noticeList: [],
        mySwiper: null,
        delayTime: 30000,
        companyList: [],
        companyData: null,
        activityList: [],
        activityData: null,
        showActivityContent: false,
        appData: null,
        sdRoot: null,
        playNum: '0',
        updateNum: '0',
        imgPath: [],
        activityName: '',
        bigDataInfo: {}
      },
      mounted: function() {
        var self = this

        if (window.localStorage.getItem('appData')) {
          self.appData = JSON.parse(window.localStorage.getItem('appData'))
          self.playNum = self.appData.batchNum
          self.updateNum = self.appData.batchNum
        }
        if (window.localStorage.getItem('noticeList')) {
          self.noticeList = JSON.parse(window.localStorage.getItem('noticeList'))
        }
        if (window.localStorage.getItem('activityList')) {
          self.activityList = JSON.parse(window.localStorage.getItem('activityList'))
        }
        if (window.localStorage.getItem('imgPath')) {
          self.imgPath = JSON.parse(window.localStorage.getItem('imgPath'))
        }
        var environment = plus.android.importClass("android.os.Environment");
        var sdRoot = environment.getExternalStorageDirectory();
        self.sdRoot = environment.getExternalStorageDirectory();
        var files = plus.android.invoke(sdRoot, "listFiles");
        var isInit = false;
        for (var i = 0; i < files.length; i++) {
          if (plus.android.invoke(files[i], "isDirectory")) {
            if (plus.android.invoke(files[i], "getName") === 'cbydpi') {
              isInit = true;
            }
          }
        }
        if (isInit == false) {
          var File = plus.android.importClass("java.io.File");
          var fd = new File(sdRoot + "/cbydpi");
          if (!fd.exists()) {
            fd.mkdirs();
          }
        }
        setInterval(function() {
          self.getData()
          self.getBigdata()
        }, 5000)


        mui('#chatbox').scroll({
          deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
        });

        self.getPolicyList()
        //    self.getCompanyList();
        //    self.getActivityList();


        self.beginslide();

        self.slidetime = setInterval(function() {
          self.slidertime = self.slidertime + 1;
          if (self.slidertime == 60) {
            self.beginslide();
          }
        }, 1000)



        function SiriWave(opt) {
          this.opt = opt || {};

          this.K = 2;
          this.F = 6;
          this.speed = this.opt.speed || 0.1;
          this.noise = this.opt.noise || 0;
          this.phase = this.opt.phase || 0;

          if (!devicePixelRatio) devicePixelRatio = 1;
          this.width = devicePixelRatio * (this.opt.width || 320);
          this.height = devicePixelRatio * (this.opt.height || 100);
          this.MAX = (this.height / 2) - 4;

          this.canvas = document.createElement('canvas');
          this.canvas.width = this.width;
          this.canvas.height = this.height;
          this.canvas.style.width = '100%';
          this.canvas.style.height = (this.height / devicePixelRatio) + 'px';

          (this.opt.container || document.body).appendChild(this.canvas);
          this.ctx = this.canvas.getContext('2d');

          this.run = false;
        }
        SiriWave.prototype = {

          _globalAttenuationFn: function(x) {
            return Math.pow(this.K * 4 / (this.K * 4 + Math.pow(x, 4)), this.K * 2);
          },

          _drawLine: function(attenuation, color, width) {
            this.ctx.moveTo(0, 0);
            this.ctx.beginPath();
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = width || 1;
            var x, y;
            for (var i = -this.K; i <= this.K; i += 0.01) {
              x = this.width * ((i + this.K) / (this.K * 2));
              y = this.height / 2 + this.noise * this._globalAttenuationFn(i) * (1 / attenuation) *
                Math.sin(this.F *
                  i - this.phase);
              this.ctx.lineTo(x, y);
            }
            this.ctx.stroke();
          },

          _clear: function() {
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.globalCompositeOperation = 'source-over';
          },

          _draw: function() {
            if (!this.run) return;

            this.phase = (this.phase + this.speed) % (Math.PI * 64);
            this._clear();
            this._drawLine(-2, 'rgba(255,255,255,0.1)');
            this._drawLine(-6, 'rgba(255,255,255,0.2)');
            this._drawLine(4, 'rgba(255,255,255,0.4)');
            this._drawLine(2, 'rgba(255,255,255,0.6)');
            this._drawLine(1, 'rgba(255,255,255,1)', 1.5);

            requestAnimationFrame(this._draw.bind(this), 1000);
          },

          start: function() {
            this.phase = 0;
            this.run = true;
            this._draw();
          },

          stop: function() {
            this.run = false;
          },

          setNoise: function(v) {
            this.noise = Math.min(v, 1) * this.MAX;
          },

          setSpeed: function(v) {
            this.speed = v;
          },

          set: function(noise, speed) {
            this.setNoise(noise);
            this.setSpeed(speed);
          }
        };

        self.SW = new SiriWave({
          width: 1080,
          height: 200,
          container: document.getElementById('siri')
        });
        self.SW.setSpeed(0.1);
        self.SW.setNoise(0.5);
        self.SW.start();
        self.SW.stop();

      },
      methods: {
        getBigdata: function() {
          var self = this
          $.ajax({
            type: "get",
            url: self.baseURL + "/wx/getBigDataInfo",
            async: false,
            success: function(data) {
              self.bigDataInfo = data.bigData

            }
          });
        },
        getData: function() {
          var self = this
          $.ajax({
            type: "post",
            url: self.baseURL + "/wx/playInfo",
            async: false,
            data: JSON.stringify({
              'playNum': self.playNum,
              'updateNum': self.updateNum
            }),
            dataType: 'json',
            contentType: 'application/json',
            dataType: 'json',
            success: function(data) {
              if (data.code == 0) {
                if (data.result == 'update') {
                  if (self.playNum == self.updateNum) {
                    if (data.bigData.show == 0) {
                      self.showBigdata = false
                    }
                    self.imgPath = []
                    self.activityList = []
                    self.noticeList = []
                    self.appData = data
                    if (self.appData.notice.length > 0) {
                      for (var i = 0; i < self.appData.notice.length; i++) {
                        $.ajax({
                          type: "get",
                          url: self.baseURL + "/wx/noticeInfo/" + self.appData.notice[i].noticeId,
                          async: false,
                          dataType: 'json',
                          success: function(data) {
                            if (self.appData.notice[i].noticeType == 1) {
                              self.activityList.push({
                                'name': self.appData.notice[i].name,
                                'id': self.appData.notice[i].noticeId,
                                'content': data
                              })
                            } else if (self.appData.notice[i].noticeType == 2) {
                              self.noticeList.push({
                                'name': self.appData.notice[i].name,
                                'id': self.appData.notice[i].noticeId,
                                'content': data
                              })
                            }
                          }
                        })
                      }
                      if (self.mySwiper) {

                        self.mySwiper.destroy();
                      }
                      self.mySwiper = new Swiper('.swiper-container', {
                        loop: true,
                        observer: true,
                        observeSlideChildren: true,
                        autoplay: {
                          delay: self.delayTime,
                          disableOnInteraction: false
                        },
                        onSlideChangeEnd: function(swiper) {

                        }
                      })
                    }
                    window.localStorage.setItem('activityList', JSON.stringify(self.activityList))
                    window.localStorage.setItem('noticeList', JSON.stringify(self.noticeList))
                    self.updateNum = data.batchNum
                    if (data.image !== null && data.image.length > 0) {
                      var File = plus.android.importClass("java.io.File");
                      var fd = new File(self.sdRoot + "/cbydpi/" + data.batchNum);
                      if (!fd.exists()) {

                        fd.mkdirs();
                      }
                      self.downLoadImg(data.image, data.batchNum)
                    } else {
                      window.localStorage.setItem('imgPath', JSON.stringify(self.imgPath))
                    }
                  }
                }
              }
              //          self.activityList = data
            },
            error: function(e) {}
          });
        },
        downLoadImg: function(imgList, batchNum) {
          var self = this
          var isStartDownLoad = true
          //      console.log(JSON.stringify(imgList))
          //      console.log(imgList.length)
          if (imgList.length == 0) {
            isStartDownload = false;
            console.log(self.imgPath)
            window.localStorage.setItem('appData', JSON.stringify(self.appData))
            self.updateNum = batchNum
            self.playNum = batchNum
            setTimeout(function() {
              self.mySwiper.destroy();
              self.mySwiper = new Swiper('.swiper-container', {
                loop: true,
                observer: true,
                observeSlideChildren: true,
                autoplay: {
                  delay: self.delayTime,
                  disableOnInteraction: false
                },
                onSlideChangeEnd: function(swiper) {

                }
              })
            }, 10000)
            return
          }

          var obj = imgList.shift();
          var imageUrl = encodeURI(obj.url);
          var hb_path = '_downloads/image/' + obj.url.substr(obj.url.lastIndexOf('/') + 1);
          var sd_path = plus.io.convertLocalFileSystemURL(hb_path); //SD卡绝对路径
          console.log(hb_path)

          var temp = new Image();
          temp.src = sd_path;
          temp.onload = function() {
            // 1存在, 则直接显示
            self.moveImage(hb_path, self.sdRoot + "/cbydpi/" + batchNum + '/', obj.time)
            self.downLoadImg(imgList, batchNum);
          };
          temp.onerror = function() {
            //执行下载
            var task = plus.downloader.createDownload(imageUrl, {
              "filename": hb_path,
              "timeout": 10,
              "retry": 2
            }, function(download, status) {
              if (status == 200) {
                console.log(hb_path)
                self.moveImage(hb_path, self.sdRoot + "/cbydpi/" + batchNum + '/', obj.time)
                //继续下载
                self.downLoadImg(imgList, batchNum);
              } else {
                //下载失败,取消下载任务,需删除本地临时文件,否则下次进来时会检查到图片已存在
                self.deleteImage(hb_path);
                download.abort();
              }
            });
            task.start();
          };
        },
        moveImage: function(path, movePath, time) {
          var self = this
          plus.io.resolveLocalFileSystemURL(path, function(entry) {
            // 可通过entry对象操作test.html文件 
            plus.io.resolveLocalFileSystemURL(movePath, function(root) {
              entry.moveTo(root, path.substr(path.lastIndexOf('/') + 1), function(entry2) {
                console.log(path)
                self.imgPath.push({
                  'url': movePath + '/' + path.substr(path.lastIndexOf('/') + 1),
                  'time': time
                })
                window.localStorage.setItem('imgPath', JSON.stringify(self.imgPath))
                console.log('下载成功', JSON.stringify(self.imgPath))
              }, function(e) {
                console.log(e.message);
              });
            }, function(error) {

            })
          }, function(e) {

          });
        },
        deleteImage: function(hb_path) {
          if (hb_path) {
            plus.io.resolveLocalFileSystemURL(hb_path, function(entry) {
              entry.remove(function(entry) {

              }, function(e) {

              });
            });
          }
        },
        getActivityList: function() {
          var self = this
          $.ajax({
            type: "get",
            url: "js/activity.json",
            async: false,
            dataType: 'json',
            success: function(data) {
              self.activityList = data
            },
            error: function(e) {}
          });
        },
        activityContent: function(id) {
          vm.slidertime = 0
          var self = this

          for (var i = 0; i < self.activityList.length; i++) {
            if (self.activityList[i].id == id) {
              self.activityData = self.activityList[i].content.playNotice.cycle
              self.showActivityContent = true
            }
          }
        },
        closeActivityContent: function() {
          vm.slidertime = 0;
          vm.showActivityContent = false
        },
        getCompanyList: function() {
          var self = this
          $.ajax({
            type: "get",
            url: "js/company.json",
            async: false,
            dataType: 'json',
            success: function(data) {
              self.companyList = data
            },
            error: function(e) {}
          });
        },
        bigdataList: function(field) {
          vm.slidertime = 0;
          vm.showBigdataList = true
          var self = this
          self.companyList = []
          $.ajax({
            type: "get",
            url: "js/company.json",
            async: false,
            dataType: 'json',
            success: function(data) {
              for (var i = 0; i < data.length; i++) {
                if (data[i].field == field) {
                  self.companyList.push(data[i])
                }
              }
              console.log(self.companyList)
              //          self.companyList = data 
            },
            error: function(e) {}
          });
        },
        // 切换语音
        StartInteractive: function() {
          vm.showBigdataInfo = false
          vm.showBigdataList = false
          vm.showPolicyInfo = false
          vm.showActivityContent = false
          vm.showSlide = false
          this.slidertime = 0;
          this.initialization();
          this.dateTime();
          this.startTransform('您好,很高兴为您服务')
        },
        // 语音合成
        startTransform: function(transformword) {
          vm.slidertime = 0;
          var receiver;

          receiver = plus.android.implements('com.iflytek.cloud.SynthesizerListener', {
            onEvent: function(arg0, arg1, arg2, arg3) {

            },
            onSpeakBegin: function() {
              vm.slidertime = 0;
            },
            onSpeakPaused: function() {
              vm.slidertime = 0;
            },
            onSpeakResumed: function() {
              vm.slidertime = 0;
            },
            onBufferProgress: function(percent, beginPos, endPos, info) {
              vm.slidertime = 0;
            },
            onSpeakProgress: function(percent, beginPos, endPos) {
              vm.slidertime = 0;
              // 合成进度
            },
            onCompleted: function(error) {
              vm.slidertime = 0;

              if (transformword.indexOf('结束') != -1 || transformword.indexOf('再见') != -1 ||
                transformword.indexOf('拜拜') != -1 || transformword.indexOf('没问题') != -1) {
                return;
              }
              vm.SW.stop();
              vm.startRecognize();
            }
          });

          var main = plus.android.runtimeMainActivity();
          var SpeechUtility = plus.android.importClass('com.iflytek.cloud.SpeechUtility');
          SpeechUtility.createUtility(main, "appid=5a6ebba2");
          var SynthesizerPlayer = plus.android.importClass('com.iflytek.cloud.SpeechSynthesizer');
          this.play = SynthesizerPlayer.createSynthesizer(main, null);
          this.play.startSpeaking(transformword, receiver);
          vm.SW.start();
        },
        // 语音识别
        startRecognize: function() {
          if (vm.play != null) {
            vm.play.pauseSpeaking(); // 暂停播放
            vm.SW.stop();
          }
          var options = {};
          options.engine = 'iFly';
          //超时时间
          // options.timeout=5000;
          options.userInterface = true;
          //           options.continue = true;

          plus.speech.startRecognize(options, function(s) {

            vm.slidertime = 0;
            $('#chatbox').children('div').append('<div class="chatbox_right clearfix"><p>' + s +
              '</p></div>');
            mui('#chatbox').scroll().reLayout();
            mui('#chatbox').scroll().scrollToBottom();
            if (s.replace(/(^\s*)|(\s*$)/g, '') !== '') {
              vm.knowledgebase(s);
            }
          }, function(e) {

            if (e.code == 4001) {
              $('#chatbox').children('div').append(
                '<div class="chatbox_left clearfix"><p>我没有听清，请您再问我一遍吧</p></div>');
            }
          });
        },
        // 调用知识库
        knowledgebase: function(word) {
          vm.slidertime = 0;
          var data = {
            callSign: vm.datetime,
            chat: word,
            user: 'admin',
            chatResource: 'screen'
          }
          $.ajax({
            type: "post",
            url: "http://wx.ofaai.com:8383/nature/wx/smart",
            async: true,
            data: JSON.stringify(data),
            dataType: 'json',
            contentType: 'application/json',
            success: function(r) {
              vm.slidertime = 0;
              if (r.result == 'success') {
                $('#chatbox').children('div').append('<div class="chatbox_left clearfix"><p>' + r.answer +
                  '</p></div>');
                mui('#chatbox').scroll().reLayout();
                mui('#chatbox').scroll().scrollToBottom();
                vm.startTransform(r.answer);
              } else {
                $('#chatbox').children('div').append(
                  '<div class="chatbox_left clearfix"><p>感谢您的咨询, 我会尽快学会的, 为了不耽误您要了解的事情, 您可咨询人工服务台。</p></div>'
                );
                mui('#chatbox').scroll().reLayout();
                mui('#chatbox').scroll().scrollToBottom();
                vm.startTransform('感谢您的咨询, 我会尽快学会的, 为了不耽误您要了解的事情, 您可咨询人工服务台。');
              }
            }
          });
        },
        // 轮播设置
        beginslide: function() {
          var self = this

          this.showBigdataInfo = false
          this.showBigdataList = false
          this.showPolicyInfo = false
          this.showActivityContent = false
          if (this.play != null) {
            this.play.pauseSpeaking(); // 暂停播放
            this.SW.stop();
          }
          Vue.nextTick(function() {
            if (self.mySwiper == null) {
              self.mySwiper = new Swiper('.swiper-container', {
                loop: true,
                observer: true,
                observeSlideChildren: true,
                autoplay: {
                  delay: self.delayTime,
                  disableOnInteraction: false
                },
                onSlideChangeEnd: function(swiper) {

                }
              })
            } else if (self.showSlide == false) {
              self.mySwiper.destroy();
              self.mySwiper = new Swiper('.swiper-container', {
                loop: true,
                observer: true,
                observeSlideChildren: true,
                autoplay: {
                  delay: self.delayTime,
                  disableOnInteraction: false
                },
                onSlideChangeEnd: function(swiper) {

                }
              })
              self.showSlide = true
            }
          })
        },
        // 时间戳
        dateTime: function() {
          var date = new Date();
          var month = date.getMonth() + 1;
          var day = date.getDate();
          var hour = date.getHours();
          var minute = date.getMinutes();
          var second = date.getSeconds();
          if (month < 10) {
            month = "0" + month.toString()
          };
          if (day < 10) {
            day = "0" + day.toString()
          };
          if (hour < 10) {
            hour = "0" + hour.toString()
          };
          if (minute < 10) {
            minute = "0" + minute.toString()
          };
          if (second < 10) {
            second = "0" + second.toString()
          };
          this.datetime = date.getFullYear().toString() + month + day + hour + minute + second;
        },
        // 悬浮球
        mouseDown: function(obj, e) {
          var div = document.getElementById("mov");
          this.objX = div.offsetLeft;
          this.objY = div.offsetTop;
          this.mouseX = e.changedTouches[0].clientX;
          this.mouseY = e.changedTouches[0].clientY;
          this.isDowm = true;
        },
        mouseMove: function(e) {
          var div = document.getElementById("mov");
          var x = e.changedTouches[0].clientX;
          var y = e.changedTouches[0].clientY;
          if (this.isDowm) {
            div.style.right = parseInt(this.objX) - parseInt(x) + "px";
            div.style.top = parseInt(this.objY) + parseInt(y) - parseInt(this.mouseY) + "px";
          }
        },
        mouseUp: function(e) {
          if (this.isDowm) {
            var x = e.changedTouches[0].clientX;
            var y = e.changedTouches[0].clientY;
            var div = document.getElementById("mov");
            div.style.right = "0px";
            div.style.top = parseInt(this.objY) + parseInt(y) - parseInt(this.mouseY) + "px";
            isDowm = false;
          }
        },
        toggleButton: function() {
          if ($('#mov').children('div').css('display') == 'none') {
            $('#mov').children('div').show()
          } else {
            $('#mov').children('div').hide()
          }
        },
        // 悬浮球结束
        // 退出
        exitApp: function() {
          mui.prompt(
            '请输入密码',
            '请输入密码',
            '提示', ['确定', '取消'],
            function(e) {
              if (e.index == 0) {
                if (e.value == 123456) {
                  plus.runtime.quit();
                } else {
                  mui.toast(
                    '密码输入错误！'
                  )
                }
              }
            }
          )
        },
        // 初始化
        initialization: function() {
          this.dateTime()
          $("#chatbox").children('div').empty().append(
            '<div class="chatbox_left clearfix"><p>您好,很高兴为您服务</p></div>');
          mui('#chatbox').scroll().reLayout();
          mui('#chatbox').scroll().scrollToBottom();
        },
        closePolicyInfo: function() {
          vm.slidertime = 0;
          vm.showPolicyInfo = false
        },
        closeBigdataList: function() {
          vm.slidertime = 0;
          vm.showBigdataList = false
        },
        closeBigdataInfo: function() {
          vm.slidertime = 0;
          vm.showBigdataInfo = false
        },
        bigdataInfo: function(id) {
          vm.slidertime = 0;
          for (var i = 0; i < vm.companyList.length; i++) {
            if (id == vm.companyList[i].id) {
              vm.companyData = vm.companyList[i]
            }
          }
          vm.showBigdataInfo = true
        },
        // 政策列表
        getPolicyList: function() {
          var self = this
          $.ajax({
            type: "get",
            url: this.baseURL + "wx/listPolicy",
            async: false,
            success: function(data) {
              console.log(data)
              if (data.code === 0) {
                if (data.policy.length > 0) {
                  self.policyData = data.policy
                  self.showPolicy = true
                }
              } else {
                self.showPolicy = false
              }
            },
            error: function(e) {
              self.showPolicy = false
            }
          });
        },
        policyContent: function(id) {
          vm.slidertime = 0;
          for (var i = 0; i < vm.policyData.length; i++) {
            if (id == vm.policyData[i].id) {
              vm.policyInfo = vm.policyData[i]
              vm.showPolicyInfo = true
            }
          }
        }
      }
    })
  })
})
